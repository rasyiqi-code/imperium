import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { paymentManager } from '@crediblemark/buayar';
import { sendEmail } from '@/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Ambil pengaturan Midtrans dari database menggunakan Prisma
    const settings = await prisma.admin_settings.findUnique({
      where: { id: 1 },
      select: {
        midtrans_client_key: true,
        midtrans_server_key: true,
        midtrans_is_production: true
      }
    });

    const isProduction = settings?.midtrans_is_production === true;
    const clientKey = settings?.midtrans_client_key || '';
    const serverKey = settings?.midtrans_server_key || '';

    const config = {
      merchantCode: clientKey,
      apiKey: serverKey,
      sandbox: !isProduction,
    };

    // 1. Verifikasi callback signature dari Midtrans menggunakan Buayar SDK
    const verifyResult = await paymentManager.verifyCallback("midtrans", body, config);

    if (!verifyResult.isValid) {
      console.error("Webhook Signature Verification Failed", body);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 2. Kueri status transaksi riil untuk mencegah serangan replay/pemalsuan
    const statusResponse = await paymentManager.checkTransaction("midtrans", {
      merchantOrderId: body.order_id
    }, config);

    if (!statusResponse.success || !statusResponse.rawResponse) {
      console.error("Failed to check status with Midtrans API", body.order_id);
      return NextResponse.json({ error: "Failed to verify transaction status" }, { status: 400 });
    }

    const transactionStatus = statusResponse.rawResponse.transaction_status;
    const fraudStatus = statusResponse.rawResponse.fraud_status;
    const userId = statusResponse.rawResponse.custom_field1;
    const orderId = body.order_id;

    if (!userId) {
      console.error('Webhook Error: User ID (custom_field1) is missing from Midtrans response');
      return NextResponse.json({ error: 'User ID missing' }, { status: 400 });
    }

    console.log(`Processing Webhook for User: ${userId}, Order: ${orderId}, Status: ${transactionStatus}`);

    if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
      if (fraudStatus === 'accept' || !fraudStatus) {
        
        // 3. Ambil entri pembayaran dari database mencocokkan orderId (bukti_transfer)
        const payment = await prisma.data_pembayaran.findFirst({
          where: { bukti_transfer: orderId }
        });

        if (!payment) {
          console.error("Webhook Error: Payment record not found in database for order_id:", orderId);
          return NextResponse.json({ error: "Payment record not found" }, { status: 400 });
        }

        // 4. Ambil detail paket untuk mendapatkan durasi hari
        const paket = await prisma.data_paket_vip.findFirst({
          where: { nama_paket: payment.nama_paket as string },
          select: { durasi_hari: true }
        });

        const durationDays = paket ? (paket.durasi_hari || 30) : 30;

        // Ambil pengaturan Midtrans dari database menggunakan Prisma untuk mode perpanjangan
        const settingsUpgrade = await prisma.admin_settings.findUnique({
          where: { id: 1 },
          select: { midtrans_upgrade_mode: true }
        });
        
        const upgradeMode = settingsUpgrade?.midtrans_upgrade_mode || 'stacking';

        let baseDate = new Date();

        if (upgradeMode === 'stacking') {
          // Ambil keanggotaan aktif saat ini untuk memperpanjang durasi
          const currentMember = await prisma.data_member_vip.findUnique({
            where: { id_user_auth: userId },
            select: { tanggal_berakhir: true, status_aktif: true }
          });

          if (currentMember && (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && currentMember.tanggal_berakhir) {
            const currentExpiry = new Date(currentMember.tanggal_berakhir);
            if (currentExpiry > baseDate) {
              baseDate = currentExpiry;
            }
          }
        }

        const expiryDate = new Date(baseDate);
        expiryDate.setDate(expiryDate.getDate() + durationDays);


        // 5. Perbarui status pembayaran di tabel data_pembayaran menggunakan Prisma
        await prisma.data_pembayaran.update({
          where: { id: payment.id },
          data: { status_pembayaran: 'success' }
        });

        // 6. Simpan ID Discord lama jika ada agar tidak terhapus, lalu bersihkan keanggotaan ganda dan buat data baru
        const existingMember = await prisma.data_member_vip.findUnique({
          where: { id_user_auth: userId },
          select: { id_discord_user: true }
        });
        const savedDiscordId = existingMember?.id_discord_user || null;

        await prisma.data_member_vip.deleteMany({
          where: { id_user_auth: userId }
        });

        await prisma.data_member_vip.create({
          data: {
            id_user_auth: userId,
            email_member: payment.email_member,
            nama_paket: payment.nama_paket,
            harga_bayar: Number(payment.harga_bayar),
            status_aktif: 'aktif',
            tanggal_berakhir: expiryDate,
            id_discord_user: savedDiscordId
          }
        });

        // 7. Perbarui Plan Profil Pengguna menjadi VIP
        await prisma.profiles.update({
          where: { id: userId },
          data: { plan: 'vip', plan_status: 'vip' }
        });

        // 8. Catat Notifikasi Sukses
        await prisma.notifications.create({
          data: {
            user_id: userId,
            title: 'Pembayaran Sukses!',
            message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
            type: 'success'
          }
        });

        // 9. Kirim Email Notifikasi via Resend
        try {
          const targetUser = await prisma.profiles.findUnique({
            where: { id: userId },
            select: { full_name: true }
          });

          const expiryDateFormatted = expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
          const mailHtml = `<div style="background-color: #000; color: #fff; font-family: sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #fbbf24; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Imperium Crypto</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase;">Payment Successful</p>
  </div>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 16px; margin: 0 0 12px;">Halo <strong>${targetUser?.full_name || payment.email_member}</strong>,</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px;">
      Pembayaran Anda via Midtrans untuk paket <strong>${payment.nama_paket}</strong> telah berhasil diproses. Akun VIP Anda kini aktif!
    </p>
    <div style="background-color: #111; border: 1px solid #222; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; font-size: 13px; color: #9ca3af; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Nama Paket:</td>
          <td style="padding: 4px 0; text-align: right; color: #fbbf24;">${payment.nama_paket}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Jumlah Bayar:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">Rp ${Number(payment.harga_bayar).toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Tanggal Berakhir:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">${expiryDateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Status Transaksi:</td>
          <td style="padding: 4px 0; text-align: right; color: #10b981; font-weight: bold; text-transform: uppercase;">SUCCESS / SETTLED</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/dashboard" style="background-color: #fbbf24; color: #000; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">Masuk ke Dashboard VIP</a>
    </div>
  </div>
  <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
  <div style="text-align: center; font-size: 11px; color: #4b5563;">
    <p style="margin: 0 0 4px;">Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami.</p>
    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Imperium Crypto. All rights reserved.</p>
  </div>
</div>`;

          await sendEmail({
            to: payment.email_member,
            subject: '[Imperium Crypto] Transaksi Sukses - Akun VIP Aktif!',
            html: mailHtml,
          });
        } catch (mailErr) {
          console.error("Gagal mengirim email transaksi sukses:", mailErr);
        }
      }
    } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
      // Perbarui status menjadi failed
      await prisma.data_pembayaran.updateMany({
        where: { bukti_transfer: orderId },
        data: { status_pembayaran: 'failed' }
      });
    }

    return NextResponse.json({ status: 'OK' });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error("Webhook Internal Error:", message);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}