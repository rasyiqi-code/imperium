import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { prisma } from '@/lib/prisma';
import { calculateProratedPrice } from '@/lib/payment/helpers';
import { 
  VALID_TYPES, 
  buildChargePayload, 
  parseChargeResponse, 
  type PaymentType, 
  type MidtransChargeResponse 
} from '@/lib/payment/midtrans';


export async function POST(request: Request) {
  try {
    const { paketId, paymentType } = await request.json();

    if (!paketId || !paymentType) {
      return NextResponse.json({ error: 'paketId dan paymentType wajib diisi' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(paymentType) && paymentType !== 'snap') {
      return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 });
    }

    // 1. Authenticate user
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Ambil paket menggunakan Prisma
    const paket = await prisma.data_paket_vip.findUnique({
      where: { id: paketId }
    });

    if (!paket) {
      return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 });
    }

    if (Number(paket.harga) <= 0) {
      return NextResponse.json({ error: 'Paket gratis tidak dapat dibeli' }, { status: 400 });
    }

    // 3. Ambil pengaturan Midtrans menggunakan Prisma
    const settings = await prisma.admin_settings.findUnique({
      where: { id: 1 },
      select: {
        midtrans_server_key: true,
        midtrans_is_production: true,
        midtrans_upgrade_mode: true,
        midtrans_use_snap: true
      }
    });

    const isProduction = settings?.midtrans_is_production === true;
    const serverKey = settings?.midtrans_server_key || '';
    const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking';
    const useSnap = settings?.midtrans_use_snap === true;

    if (!serverKey) {
      return NextResponse.json({ error: 'Midtrans belum dikonfigurasi' }, { status: 500 });
    }

    // Ambil info membership aktif saat ini (berguna untuk kalkulasi proration)
    const currentMember = upgradeMode === 'proration'
      ? await prisma.data_member_vip.findUnique({ where: { id_user_auth: user.id } })
      : null;

    const finalAmount = calculateProratedPrice(currentMember, Number(paket.harga), upgradeMode);

    // 4. Generate order ID & build callback URL
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `IMP-${Date.now()}-${randomSuffix}`;
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const callbackUrl = `${origin}/dashboard/upgrade`;

    // 5. Insert pending payment menggunakan Prisma
    try {
      await prisma.data_pembayaran.create({
        data: {
          id_user_auth: user.id,
          email_member: user.email || '',
          nama_paket: paket.nama_paket,
          harga_bayar: finalAmount,
          bukti_transfer: orderId,
          status_pembayaran: 'pending'
        }
      });
    } catch (insertError: unknown) {
      const err = insertError as Error;
      console.error('Gagal mencatat transaksi pending:', err.message || err);
      return NextResponse.json({ error: 'Gagal memproses transaksi' }, { status: 500 });
    }

    const authString = Buffer.from(serverKey + ':').toString('base64');

    if (useSnap) {
      // --- LOGIKA SNAP API (REDIRECT) ---
      // Petakan tipe pembayaran ke format enabled_payments Midtrans Snap
      const mapPaymentTypeToSnap = (pType: string): string | null => {
        if (['bca', 'bni', 'bri', 'cimb', 'permata'].includes(pType)) {
          return `${pType}_va`;
        }
        if (pType === 'mandiri') {
          return 'mandiri_va';
        }
        if (pType === 'snap') {
          return null; // snap tidak memerlukan filter enabled_payments agar semuanya muncul
        }
        return pType; // qris, gopay, shopeepay, alfamart, indomaret, akulaku, kredivo
      };

      const snapBaseUrl = isProduction
        ? 'https://app.midtrans.com/snap/v1/transactions'
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const snapPaymentMethod = mapPaymentTypeToSnap(paymentType);

      const snapPayload: any = {
        transaction_details: {
          order_id: orderId,
          gross_amount: Number(finalAmount),
        },
        customer_details: {
          first_name: user.user_metadata?.full_name || 'Member Imperium',
          email: user.email || '',
        },
        item_details: [
          {
            id: orderId,
            name: paket.nama_paket,
            price: Number(finalAmount),
            quantity: 1,
          },
        ],
        callbacks: {
          finish: callbackUrl,
        },
        custom_field1: user.id,
      };

      // Hanya batasi metode pembayaran jika method yang dipilih spesifik (bukan 'snap' umum)
      if (snapPaymentMethod) {
        snapPayload.enabled_payments = [snapPaymentMethod];
      }

      const snapRes = await fetch(snapBaseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(snapPayload),
      });

      const snapResult = await snapRes.json();

      if (!snapRes.ok || !snapResult.token) {
        console.error('Midtrans Snap Error:', snapResult);
        await prisma.data_pembayaran.deleteMany({
          where: { bukti_transfer: orderId }
        });
        return NextResponse.json(
          { error: snapResult.error_messages?.[0] || 'Gagal membuat transaksi Snap' },
          { status: 400 },
        );
      }

      return NextResponse.json({
        success: true,
        type: 'redirect',
        redirectUrl: snapResult.redirect_url,
        orderId,
        grossAmount: finalAmount,
      });
    } else {
      // --- LOGIKA CORE API STANDAR (DIRECT CHARGE) ---
      const payload = buildChargePayload(
        orderId,
        Number(finalAmount),
        paymentType as PaymentType,
        user.user_metadata?.full_name || 'Member Imperium',
        user.email || '',
        paket.nama_paket,
        callbackUrl,
      );
      payload.custom_field1 = user.id;

      const midtransBaseUrl = isProduction
        ? 'https://api.midtrans.com/v2'
        : 'https://api.sandbox.midtrans.com/v2';

      const chargeRes = await fetch(`${midtransBaseUrl}/charge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Basic ${authString}`,
        },
        body: JSON.stringify(payload),
      });

      const chargeResult = (await chargeRes.json()) as MidtransChargeResponse;

      if (chargeResult.status_code && !['200', '201'].includes(chargeResult.status_code)) {
        console.error('Midtrans Charge Error:', chargeResult);
        await prisma.data_pembayaran.deleteMany({
          where: { bukti_transfer: orderId }
        });
        return NextResponse.json(
          { error: chargeResult.status_message || 'Gagal membuat transaksi' },
          { status: 400 },
        );
      }

      const parsed = parseChargeResponse(chargeResult, paymentType as PaymentType);
      return NextResponse.json(parsed);
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Charge Error:', err);
    return NextResponse.json({ error: err.message || 'Gagal membuat transaksi' }, { status: 500 });
  }
}
