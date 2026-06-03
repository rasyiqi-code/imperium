import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { prisma } from '@/lib/prisma';
import { calculateProratedPrice } from '@/lib/payment';

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

interface ChargePayload {
  transaction_details: {
    order_id: string;
    gross_amount: number;
  };
  customer_details: {
    first_name: string;
    email: string;
  };
  item_details: {
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  custom_field1: string;
  payment_type?: string;
  qris?: { acquirer: string };
  gopay?: { enable_callback: boolean; callback_url: string };
  shopeepay?: { callback_url: string };
  echannel?: { bill_info1: string; bill_info2: string };
  bank_transfer?: { bank: string };
  cstore?: { store: string; message: string };
  kredivo?: { seller_details: { address: { city: string } } };
  [key: string]: unknown;
}

interface MidtransAction {
  name: string;
  url: string;
}

interface MidtransVaNumber {
  bank: string;
  va_number: string;
}

interface MidtransChargeResponse {
  status_code?: string;
  status_message?: string;
  order_id: string;
  transaction_status: string;
  expiry_time: string;
  gross_amount: string;
  actions?: MidtransAction[];
  bill_key?: string;
  biller_code?: string;
  permata_va_number?: string;
  va_numbers?: MidtransVaNumber[];
  store?: string;
  payment_code?: string;
  redirect_url?: string;
}

function buildChargePayload(
  orderId: string,
  amount: number,
  paymentType: PaymentType,
  customerName: string,
  customerEmail: string,
  paketNama: string,
  callbackBaseUrl: string,
): ChargePayload {
  const base: ChargePayload = {
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

function parseChargeResponse(result: MidtransChargeResponse, paymentType: PaymentType) {
  const base = {
    orderId: result.order_id,
    transactionStatus: result.transaction_status,
    expiryTime: result.expiry_time,
    grossAmount: result.gross_amount,
  };

  // ─── QRIS ───────────────────────────
  if (paymentType === 'qris') {
    const qrAction = result.actions?.find((a: MidtransAction) => a.name === 'generate-qr-code');
    return { ...base, type: 'qris' as const, qrUrl: qrAction?.url || '' };
  }

  // ─── GoPay ──────────────────────────
  if (paymentType === 'gopay') {
    const qrAction = result.actions?.find((a: MidtransAction) => a.name === 'generate-qr-code');
    const dlAction = result.actions?.find((a: MidtransAction) => a.name === 'deeplink-redirect');
    return {
      ...base,
      type: 'qris' as const,
      qrUrl: qrAction?.url || '',
      deeplinkUrl: dlAction?.url || '',
    };
  }

  // ─── ShopeePay ──────────────────────
  if (paymentType === 'shopeepay') {
    const dlAction = result.actions?.find((a: MidtransAction) => a.name === 'deeplink-redirect');
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
        midtrans_upgrade_mode: true
      }
    });

    const isProduction = settings?.midtrans_is_production === true;
    const serverKey = settings?.midtrans_server_key || '';
    const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking';

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

    // 8. Parse and return
    const parsed = parseChargeResponse(chargeResult, paymentType as PaymentType);
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Charge Error:', err);
    return NextResponse.json({ error: err.message || 'Gagal membuat transaksi' }, { status: 500 });
  }
}
