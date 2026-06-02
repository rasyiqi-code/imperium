import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { supabaseServer } from '@/lib/supabaseServer';

type PaymentType =
  | 'qris'
  | 'gopay'
  | 'shopeepay'
  | 'bca'
  | 'bni'
  | 'bri'
  | 'mandiri'
  | 'permata'
  | 'cimb'
  | 'alfamart'
  | 'indomaret'
  | 'akulaku'
  | 'kredivo';

const VALID_TYPES: PaymentType[] = [
  'qris', 'gopay', 'shopeepay',
  'bca', 'bni', 'bri', 'mandiri', 'permata', 'cimb',
  'alfamart', 'indomaret',
  'akulaku', 'kredivo',
];

function buildChargePayload(
  orderId: string,
  amount: number,
  paymentType: PaymentType,
  customerName: string,
  customerEmail: string,
  paketNama: string,
  callbackBaseUrl: string,
) {
  const base: any = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
    },
    item_details: [
      {
        id: orderId,
        name: paketNama,
        price: amount,
        quantity: 1,
      },
    ],
    custom_field1: '', // userId — set by caller
  };

  switch (paymentType) {
    // ─── E-Wallet & QRIS ──────────────────
    case 'qris':
      return { ...base, payment_type: 'qris', qris: { acquirer: 'gopay' } };
    case 'gopay':
      return {
        ...base,
        payment_type: 'gopay',
        gopay: { enable_callback: true, callback_url: callbackBaseUrl },
      };
    case 'shopeepay':
      return {
        ...base,
        payment_type: 'shopeepay',
        shopeepay: { callback_url: callbackBaseUrl },
      };

    // ─── Virtual Account ──────────────────
    case 'mandiri':
      return {
        ...base,
        payment_type: 'echannel',
        echannel: { bill_info1: 'Payment', bill_info2: 'Imperium VIP' },
      };
    case 'permata':
      return { ...base, payment_type: 'permata' };
    case 'cimb':
      return {
        ...base,
        payment_type: 'bank_transfer',
        bank_transfer: { bank: 'cimb' },
      };
    case 'bca':
    case 'bni':
    case 'bri':
      return {
        ...base,
        payment_type: 'bank_transfer',
        bank_transfer: { bank: paymentType },
      };

    // ─── Convenience Store ────────────────
    case 'alfamart':
      return {
        ...base,
        payment_type: 'cstore',
        cstore: { store: 'alfamart', message: 'Imperium VIP Payment' },
      };
    case 'indomaret':
      return {
        ...base,
        payment_type: 'cstore',
        cstore: { store: 'indomaret', message: 'Imperium VIP Payment' },
      };

    // ─── PayLater ─────────────────────────
    case 'akulaku':
      return { ...base, payment_type: 'akulaku' };
    case 'kredivo':
      return {
        ...base,
        payment_type: 'kredivo',
        seller_details: { address: { city: 'Jakarta' } },
      };

    default:
      return base;
  }
}

function parseChargeResponse(result: any, paymentType: PaymentType) {
  const base = {
    orderId: result.order_id,
    transactionStatus: result.transaction_status,
    expiryTime: result.expiry_time,
    grossAmount: result.gross_amount,
  };

  // ─── QRIS ───────────────────────────
  if (paymentType === 'qris') {
    const qrAction = result.actions?.find((a: any) => a.name === 'generate-qr-code');
    return { ...base, type: 'qris' as const, qrUrl: qrAction?.url || '' };
  }

  // ─── GoPay ──────────────────────────
  if (paymentType === 'gopay') {
    const qrAction = result.actions?.find((a: any) => a.name === 'generate-qr-code');
    const dlAction = result.actions?.find((a: any) => a.name === 'deeplink-redirect');
    return {
      ...base,
      type: 'qris' as const,
      qrUrl: qrAction?.url || '',
      deeplinkUrl: dlAction?.url || '',
    };
  }

  // ─── ShopeePay ──────────────────────
  if (paymentType === 'shopeepay') {
    const dlAction = result.actions?.find((a: any) => a.name === 'deeplink-redirect');
    return {
      ...base,
      type: 'redirect' as const,
      redirectUrl: dlAction?.url || '',
      redirectLabel: 'Buka ShopeePay',
    };
  }

  // ─── Mandiri Bill ───────────────────
  if (paymentType === 'mandiri') {
    return {
      ...base,
      type: 'va' as const,
      bank: 'mandiri',
      vaNumber: result.bill_key || '',
      billerCode: result.biller_code || '',
    };
  }

  // ─── Permata VA ─────────────────────
  if (paymentType === 'permata') {
    return {
      ...base,
      type: 'va' as const,
      bank: 'permata',
      vaNumber: result.permata_va_number || '',
    };
  }

  // ─── Bank Transfer VA (BCA, BNI, BRI, CIMB) ──
  if (['bca', 'bni', 'bri', 'cimb'].includes(paymentType)) {
    const va = result.va_numbers?.[0];
    return {
      ...base,
      type: 'va' as const,
      bank: va?.bank || paymentType,
      vaNumber: va?.va_number || '',
    };
  }

  // ─── Convenience Store ──────────────
  if (paymentType === 'alfamart' || paymentType === 'indomaret') {
    return {
      ...base,
      type: 'cstore' as const,
      store: result.store || paymentType,
      paymentCode: result.payment_code || '',
    };
  }

  // ─── PayLater (Akulaku, Kredivo) ────
  if (paymentType === 'akulaku' || paymentType === 'kredivo') {
    return {
      ...base,
      type: 'redirect' as const,
      redirectUrl: result.redirect_url || '',
      redirectLabel: paymentType === 'akulaku' ? 'Buka Akulaku' : 'Buka Kredivo',
    };
  }

  // fallback
  return { ...base, type: 'unknown' as const };
}

export async function POST(request: Request) {
  try {
    const { paketId, paymentType } = await request.json();

    if (!paketId || !paymentType) {
      return NextResponse.json({ error: 'paketId dan paymentType wajib diisi' }, { status: 400 });
    }

    if (!VALID_TYPES.includes(paymentType)) {
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

    // 2. Fetch package
    const { data: paket, error: dbError } = await supabaseServer
      .from('data_paket_vip')
      .select('*')
      .eq('id', paketId)
      .single();

    if (dbError || !paket) {
      return NextResponse.json({ error: 'Paket tidak ditemukan' }, { status: 404 });
    }

    // 3. Fetch Midtrans settings
    const { data: settings } = (await supabaseServer
      .from('admin_settings')
      .select('midtrans_server_key, midtrans_is_production, midtrans_upgrade_mode')
      .eq('id', 1)
      .maybeSingle()) as any;

    const isProduction = settings?.midtrans_is_production === true;
    const serverKey = settings?.midtrans_server_key || '';
    const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking';

    if (!serverKey) {
      return NextResponse.json({ error: 'Midtrans belum dikonfigurasi' }, { status: 500 });
    }

    let finalAmount = Number(paket.harga);

    if (upgradeMode === 'proration') {
      const { data: currentMember } = await supabaseServer
        .from('data_member_vip')
        .select('*')
        .eq('id_user_auth', user.id)
        .maybeSingle() as any;

      if (currentMember && (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && currentMember.tanggal_berakhir) {
        const today = new Date();
        const expiry = new Date(currentMember.tanggal_berakhir);

        if (expiry > today) {
          const created = currentMember.dibuat_pada 
            ? new Date(currentMember.dibuat_pada) 
            : (currentMember.created_at ? new Date(currentMember.created_at) : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000));

          let totalDays = Math.ceil((expiry.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
          if (totalDays <= 0) totalDays = 30;

          let remainingDays = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
          if (remainingDays < 0) remainingDays = 0;

          const oldPaidAmount = Number(currentMember.harga_bayar) || 0;
          const remainingValue = oldPaidAmount * (remainingDays / totalDays);

          finalAmount = Math.max(10000, Number(paket.harga) - remainingValue);
        }
      }
    }

    // 4. Generate order ID & build callback URL
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `IMP-${Date.now()}-${randomSuffix}`;
    const origin = request.headers.get('origin') || 'http://localhost:3000';
    const callbackUrl = `${origin}/dashboard/upgrade`;

    // 5. Insert pending payment
    const { error: insertError } = await supabaseServer.from('data_pembayaran').insert({
      id_user_auth: user.id,
      email_member: user.email || '',
      nama_paket: paket.nama_paket,
      harga_bayar: finalAmount,
      bukti_transfer: orderId,
      status_pembayaran: 'pending',
    });

    if (insertError) {
      console.error('Gagal mencatat transaksi pending:', insertError.message);
      return NextResponse.json({ error: 'Gagal memproses transaksi' }, { status: 500 });
    }

    // 6. Build charge payload
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

    // 7. Call Midtrans Core API
    const midtransBaseUrl = isProduction
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2';

    const authString = Buffer.from(serverKey + ':').toString('base64');

    const chargeRes = await fetch(`${midtransBaseUrl}/charge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
      },
      body: JSON.stringify(payload),
    });

    const chargeResult = await chargeRes.json();

    if (chargeResult.status_code && !['200', '201'].includes(chargeResult.status_code)) {
      console.error('Midtrans Charge Error:', chargeResult);
      await supabaseServer.from('data_pembayaran').delete().eq('bukti_transfer', orderId);
      return NextResponse.json(
        { error: chargeResult.status_message || 'Gagal membuat transaksi' },
        { status: 400 },
      );
    }

    // 8. Parse and return
    const parsed = parseChargeResponse(chargeResult, paymentType as PaymentType);
    return NextResponse.json(parsed);
  } catch (error: any) {
    console.error('Charge Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat transaksi' }, { status: 500 });
  }
}
