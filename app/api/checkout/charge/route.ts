import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { supabaseServer } from '@/lib/supabaseServer';

type PaymentType = 'qris' | 'bca' | 'bni' | 'bri' | 'mandiri' | 'permata';

function buildChargePayload(
  orderId: string,
  amount: number,
  paymentType: PaymentType,
  customerName: string,
  customerEmail: string
) {
  const base = {
    transaction_details: {
      order_id: orderId,
      gross_amount: amount,
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
    },
    custom_field1: '', // will be set to userId by caller
  };

  switch (paymentType) {
    case 'qris':
      return { ...base, payment_type: 'qris', qris: { acquirer: 'gopay' } };
    case 'mandiri':
      return {
        ...base,
        payment_type: 'echannel',
        echannel: {
          bill_info1: 'Payment',
          bill_info2: 'Imperium VIP',
        },
      };
    case 'permata':
      return {
        ...base,
        payment_type: 'permata',
      };
    default:
      // bca, bni, bri
      return {
        ...base,
        payment_type: 'bank_transfer',
        bank_transfer: { bank: paymentType },
      };
  }
}

function parseChargeResponse(result: any, paymentType: PaymentType) {
  const base = {
    orderId: result.order_id,
    transactionStatus: result.transaction_status,
    expiryTime: result.expiry_time,
    grossAmount: result.gross_amount,
  };

  if (paymentType === 'qris') {
    const qrAction = result.actions?.find((a: any) => a.name === 'generate-qr-code');
    return {
      ...base,
      type: 'qris' as const,
      qrUrl: qrAction?.url || '',
      qrString: result.qr_string || '',
    };
  }

  if (paymentType === 'mandiri') {
    return {
      ...base,
      type: 'va' as const,
      bank: 'mandiri',
      vaNumber: result.bill_key || '',
      billerCode: result.biller_code || '',
    };
  }

  if (paymentType === 'permata') {
    return {
      ...base,
      type: 'va' as const,
      bank: 'permata',
      vaNumber: result.permata_va_number || '',
    };
  }

  // BCA, BNI, BRI
  const va = result.va_numbers?.[0];
  return {
    ...base,
    type: 'va' as const,
    bank: va?.bank || paymentType,
    vaNumber: va?.va_number || '',
  };
}

export async function POST(request: Request) {
  try {
    const { paketId, paymentType } = await request.json();

    if (!paketId || !paymentType) {
      return NextResponse.json({ error: 'paketId dan paymentType wajib diisi' }, { status: 400 });
    }

    const validTypes: PaymentType[] = ['qris', 'bca', 'bni', 'bri', 'mandiri', 'permata'];
    if (!validTypes.includes(paymentType)) {
      return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 });
    }

    // 1. Authenticate user
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
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
    const { data: settings } = await supabaseServer
      .from('admin_settings')
      .select('midtrans_server_key, midtrans_is_production')
      .eq('id', 1)
      .maybeSingle() as any;

    const isProduction = settings?.midtrans_is_production === true;
    const serverKey = settings?.midtrans_server_key || '';

    if (!serverKey) {
      return NextResponse.json({ error: 'Midtrans belum dikonfigurasi' }, { status: 500 });
    }

    // 4. Generate order ID
    const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
    const orderId = `IMP-${Date.now()}-${randomSuffix}`;

    // 5. Insert pending payment
    const { error: insertError } = await supabaseServer
      .from('data_pembayaran')
      .insert({
        id_user_auth: user.id,
        email_member: user.email || '',
        nama_paket: paket.nama_paket,
        harga_bayar: paket.harga,
        bukti_transfer: orderId,
        status_pembayaran: 'pending',
      });

    if (insertError) {
      console.error('Gagal mencatat transaksi pending:', insertError.message);
      return NextResponse.json({ error: 'Gagal memproses pendaftaran transaksi' }, { status: 500 });
    }

    // 6. Build charge payload
    const payload = buildChargePayload(
      orderId,
      Number(paket.harga),
      paymentType as PaymentType,
      user.user_metadata?.full_name || 'Member Imperium',
      user.email || ''
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
      // Clean up pending payment
      await supabaseServer
        .from('data_pembayaran')
        .delete()
        .eq('bukti_transfer', orderId);
      return NextResponse.json(
        { error: chargeResult.status_message || 'Gagal membuat transaksi' },
        { status: 400 }
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
