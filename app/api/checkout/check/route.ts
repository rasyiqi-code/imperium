import { NextResponse } from 'next/server';
import { paymentManager } from '@crediblemark/buayar';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST() {
  try {
    // 1. Authenticate user server-side
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch pending payments for this user
    const { data: pendingPayments, error: payErr } = await supabaseServer
      .from('data_pembayaran')
      .select('*')
      .eq('id_user_auth', user.id)
      .eq('status_pembayaran', 'pending');

    if (payErr || !pendingPayments || pendingPayments.length === 0) {
      return NextResponse.json({ message: "No pending payments found" });
    }

    // Fetch Midtrans settings from database
    const { data: settings } = await supabaseServer
      .from('admin_settings')
      .select('midtrans_client_key, midtrans_server_key, midtrans_is_production')
      .eq('id', 1)
      .maybeSingle() as any;

    const isProduction = settings?.midtrans_is_production === true;
    const clientKey = settings?.midtrans_client_key || '';
    const serverKey = settings?.midtrans_server_key || '';

    const config = {
      merchantCode: clientKey,
      apiKey: serverKey,
      sandbox: !isProduction,
    };

    let updatedCount = 0;

    for (const payment of pendingPayments) {
      const orderId = payment.bukti_transfer; // unique orderId is stored here
      if (!orderId || !orderId.startsWith('IMP-')) continue;

      try {
        // 3. Query Midtrans API directly to check actual status
        const statusResponse = await paymentManager.checkTransaction("midtrans", {
          merchantOrderId: orderId
        }, config);

        if (!statusResponse.success || !statusResponse.rawResponse) {
          continue;
        }

        const transactionStatus = statusResponse.rawResponse.transaction_status;
        const fraudStatus = statusResponse.rawResponse.fraud_status;

        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
          if (fraudStatus === 'accept' || !fraudStatus) {
            // 4. Fetch package details to get duration
            const { data: paket } = await supabaseServer
              .from('data_paket_vip')
              .select('durasi_hari')
              .eq('nama_paket', payment.nama_paket)
              .single();

            const durationDays = paket ? paket.durasi_hari : 30;
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + durationDays);

            // 5. Update Status Pembayaran to success
            await supabaseServer
              .from('data_pembayaran')
              .update({ status_pembayaran: 'success' })
              .eq('id', payment.id);

            // 6. Clear duplicate membership and insert active VIP membership
            await supabaseServer
              .from('data_member_vip')
              .delete()
              .eq('id_user_auth', user.id);

            await supabaseServer
              .from('data_member_vip')
              .insert({
                id_user_auth: user.id,
                email_member: payment.email_member,
                nama_paket: payment.nama_paket,
                harga_bayar: payment.harga_bayar,
                status_aktif: 'aktif',
                kode_invite_unik: 'imperium-vip-invite',
                tanggal_berakhir: expiryDate.toISOString()
              });

            // 7. Update User Profile Plan to VIP
            await supabaseServer
              .from('profiles')
              .update({ plan: 'vip', plan_status: 'vip' })
              .eq('id', user.id);

            // 8. Insert Notification
            await supabaseServer
              .from('notifications')
              .insert({
                user_id: user.id,
                title: 'Pembayaran Sukses!',
                message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
                type: 'success'
              });

            updatedCount++;
          }
        } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
          await supabaseServer
            .from('data_pembayaran')
            .update({ status_pembayaran: 'failed' })
            .eq('id', payment.id);
        }
      } catch (checkErr) {
        console.error(`Failed to check status for order ${orderId}:`, checkErr);
      }
    }

    return NextResponse.json({ message: `Checked pending payments. Updated ${updatedCount} transactions.` });

  } catch (err: any) {
    console.error("Check Pending Payment Error:", err);
    return NextResponse.json({ error: err.message || "Failed to check payments" }, { status: 500 });
  }
}
