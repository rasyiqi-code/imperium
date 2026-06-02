import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
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

    // Ambil pengaturan Midtrans menggunakan Prisma
    const settings = await prisma.admin_settings.findUnique({
      where: { id: 1 },
      select: {
        midtrans_server_key: true,
        midtrans_is_production: true
      }
    });

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
