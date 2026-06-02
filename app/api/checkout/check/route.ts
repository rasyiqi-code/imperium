import { NextResponse } from 'next/server';
import { paymentManager } from '@crediblemark/buayar';
import { createSupabaseServerClient } from '@/lib/supabaseServerClient';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // 1. Otentikasi user di sisi server menggunakan cookie sesi client
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Ambil transaksi pending milik user saat ini menggunakan Prisma
    const pendingPayments = await prisma.data_pembayaran.findMany({
      where: {
        id_user_auth: user.id,
        status_pembayaran: 'pending'
      }
    });

    if (!pendingPayments || pendingPayments.length === 0) {
      return NextResponse.json({ message: "No pending payments found" });
    }

    // Ambil pengaturan Midtrans dari database menggunakan Prisma
    const settings = await prisma.admin_settings.findUnique({
      where: { id: 1 },
      select: {
        midtrans_client_key: true,
        midtrans_server_key: true,
        midtrans_is_production: true,
        midtrans_upgrade_mode: true
      }
    });

    const isProduction = settings?.midtrans_is_production === true;
    const clientKey = settings?.midtrans_client_key || '';
    const serverKey = settings?.midtrans_server_key || '';
    const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking';

    const config = {
      merchantCode: clientKey,
      apiKey: serverKey,
      sandbox: !isProduction,
    };

    let updatedCount = 0;

    for (const payment of pendingPayments) {
      const orderId = payment.bukti_transfer; // ID pesanan unik disimpan di sini
      if (!orderId || !orderId.startsWith('IMP-')) continue;

      try {
        // 3. Kueri langsung ke API Midtrans untuk mendapatkan status riil transaksi
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
            // 4. Ambil durasi paket dari database menggunakan Prisma
            const paket = await prisma.data_paket_vip.findFirst({
              where: { nama_paket: payment.nama_paket },
              select: { durasi_hari: true }
            });

            const durationDays = paket ? paket.durasi_hari : 30;

            let baseDate = new Date();
            if (upgradeMode === 'stacking') {
              // Ambil keanggotaan aktif saat ini untuk memperpanjang durasi
              const currentMember = await prisma.data_member_vip.findUnique({
                where: { id_user_auth: user.id },
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

            // 5. Perbarui Status Pembayaran menjadi success di database
            await prisma.data_pembayaran.update({
              where: { id: payment.id },
              data: { status_pembayaran: 'success' }
            });

            // 6. Hapus keanggotaan VIP lama dan buat data aktif baru menggunakan Prisma
            await prisma.data_member_vip.deleteMany({
              where: { id_user_auth: user.id }
            });

            await prisma.data_member_vip.create({
              data: {
                id_user_auth: user.id,
                email_member: payment.email_member,
                nama_paket: payment.nama_paket,
                harga_bayar: Number(payment.harga_bayar),
                status_aktif: 'aktif',
                kode_invite_unik: 'imperium-vip-invite',
                tanggal_berakhir: expiryDate
              }
            });

            // 7. Perbarui paket profil pengguna menjadi VIP
            await prisma.profiles.update({
              where: { id: user.id },
              data: { plan: 'vip', plan_status: 'vip' }
            });

            // 8. Catat notifikasi sukses
            await prisma.notifications.create({
              data: {
                user_id: user.id,
                title: 'Pembayaran Sukses!',
                message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
                type: 'success'
              }
            });

            updatedCount++;
          }
        } else if (transactionStatus === 'deny' || transactionStatus === 'cancel' || transactionStatus === 'expire') {
          await prisma.data_pembayaran.update({
            where: { id: payment.id },
            data: { status_pembayaran: 'failed' }
          });
        }
      } catch (checkErr) {
        console.error(`Gagal memeriksa status transaksi untuk ID order ${orderId}:`, checkErr);
      }
    }

    return NextResponse.json({ message: `Checked pending payments. Updated ${updatedCount} transactions.` });

  } catch (err: any) {
    console.error("Check Pending Payment Error:", err);
    return NextResponse.json({ error: err.message || "Failed to check payments" }, { status: 500 });
  }
}
