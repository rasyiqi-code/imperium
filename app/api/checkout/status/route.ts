import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { getAdminSettings } from '@/lib/adminSettings';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json({ error: 'orderId required' }, { status: 400 });
    }

    // Authenticate
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validasi kepemilikan transaksi untuk mencegah IDOR (Insecure Direct Object Reference)
    // Admin dikecualikan dari pengecekan kepemilikan
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { plan: true }
    });

    if (profile?.plan !== 'admin') {
      const payment = await prisma.data_pembayaran.findFirst({
        where: {
          bukti_transfer: orderId,
          id_user_auth: user.id
        }
      });

      if (!payment) {
        return NextResponse.json({ error: 'Transaksi tidak ditemukan atau tidak sah' }, { status: 403 });
      }
    }

    // Ambil pengaturan Midtrans dari cache (menghindari query berulang)
    const settings = await getAdminSettings();

    const isProduction = settings?.midtrans_is_production === true;
    const serverKey = settings?.midtrans_server_key || '';

    const midtransBaseUrl = isProduction
      ? 'https://api.midtrans.com/v2'
      : 'https://api.sandbox.midtrans.com/v2';

    const authString = Buffer.from(serverKey + ':').toString('base64');

    const statusRes = await fetch(`${midtransBaseUrl}/${orderId}/status`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Basic ${authString}`,
      },
    });

    const statusResult = await statusRes.json();

    return NextResponse.json({
      orderId: statusResult.order_id,
      transactionStatus: statusResult.transaction_status,
      paymentType: statusResult.payment_type,
      statusCode: statusResult.status_code,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Status Check Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
