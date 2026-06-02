import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'
import { supabaseServer } from '@/lib/supabaseServer'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { sendEmail } from '@/lib/email'
import { paymentManager } from '@crediblemark/buayar'

export async function POST(request: Request) {
  try {
    // 1. Otentikasi pengguna menggunakan cookie sesi client
    const clientSupabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verifikasi role admin di sisi server menggunakan Prisma
    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { plan: true }
    })

    if (!profile || profile.plan !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Proses tindakan admin
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'upgradeManual': {
        const { userId, planId } = body
        if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
        
        // Ambil detail target pengguna menggunakan Prisma
        const targetUser = await prisma.profiles.findUnique({
          where: { id: userId },
          select: { email: true, full_name: true }
        })
        
        if (!targetUser || !targetUser.email) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Ambil detail paket VIP secara dinamis menggunakan Prisma
        const plan = await prisma.data_paket_vip.findUnique({
          where: { id: planId }
        })

        if (!plan) {
          return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 })
        }

        // Ambil info membership aktif saat ini (berguna untuk kalkulasi proration)
        const currentMember = await prisma.data_member_vip.findUnique({
          where: { id_user_auth: userId }
        })

        // Ambil setelan Midtrans dari database untuk mendapatkan upgrade mode
        const settings = await prisma.admin_settings.findUnique({
          where: { id: 1 },
          select: { midtrans_upgrade_mode: true }
        })
        const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking';

        let baseDate = new Date();
        const planHarga = Number(plan.harga);
        let finalAmount = planHarga;

        if (upgradeMode === 'proration') {
          if (currentMember && (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && currentMember.tanggal_berakhir) {
            const today = new Date();
            const expiry = new Date(currentMember.tanggal_berakhir);

            if (expiry > today) {
              const created = currentMember.created_at ? new Date(currentMember.created_at) : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

              let totalDays = Math.ceil((expiry.getTime() - created.getTime()) / (24 * 60 * 60 * 1000));
              if (totalDays <= 0) totalDays = 30;

              let remainingDays = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000));
              if (remainingDays < 0) remainingDays = 0;

              const oldPaidAmount = Number(currentMember.harga_bayar) || 0;
              const remainingValue = oldPaidAmount * (remainingDays / totalDays);

              finalAmount = Math.max(10000, planHarga - remainingValue);
            }
          }
        } else {
          // Stacking mode: perpanjang masa aktif dari tanggal berakhir sebelumnya jika di masa depan
          if (currentMember && (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && currentMember.tanggal_berakhir) {
            const currentExpiry = new Date(currentMember.tanggal_berakhir);
            if (currentExpiry > baseDate) {
              baseDate = currentExpiry;
            }
          }
        }

        const expiryDate = new Date(baseDate);
        expiryDate.setDate(expiryDate.getDate() + plan.durasi_hari);

        // Menjalankan transaksi Prisma untuk integritas data
        await prisma.$transaction([
          // Update profile ke status VIP
          prisma.profiles.update({
            where: { id: userId },
            data: { plan: 'vip', plan_status: 'vip' }
          }),
          // Hapus entri data member vip sebelumnya jika ada
          prisma.data_member_vip.deleteMany({
            where: { id_user_auth: userId }
          }),
          // Buat entri data member vip baru
          prisma.data_member_vip.create({
            data: {
              id_user_auth: userId,
              email_member: targetUser.email,
              nama_paket: plan.nama_paket,
              harga_bayar: finalAmount,
              status_aktif: 'aktif',
              kode_invite_unik: 'imperium-vip-invite',
              tanggal_berakhir: expiryDate
            }
          })
        ])

        // Kirim email notifikasi
        const expiryDateFormatted = expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        const mailHtml = `<div style="background-color: #000; color: #fff; font-family: sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #fbbf24; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Imperium Crypto</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase;">VIP Membership Activation</p>
  </div>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 16px; margin: 0 0 12px;">Halo <strong>${targetUser.full_name || targetUser.email}</strong>,</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px;">
      Akun Anda telah berhasil di-upgrade secara manual oleh Admin ke status <strong>VIP Membership</strong>. Sekarang Anda dapat mengakses seluruh fitur premium, sinyal eksklusif, dan grup komunitas VIP.
    </p>
    <div style="background-color: #111; border: 1px solid #222; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; font-size: 13px; color: #9ca3af; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Nama Paket:</td>
          <td style="padding: 4px 0; text-align: right; color: #fbbf24;">Paket 1 Tahun (Manual Upgrade)</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Masa Aktif:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">365 Hari</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Tanggal Berakhir:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">${expiryDateFormatted}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Status:</td>
          <td style="padding: 4px 0; text-align: right; color: #10b981; font-weight: bold; text-transform: uppercase;">Aktif</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/dashboard" style="background-color: #fbbf24; color: #000; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">Masuk ke Dashboard</a>
    </div>
  </div>
  <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
  <div style="text-align: center; font-size: 11px; color: #4b5563;">
    <p style="margin: 0 0 4px;">Jika Anda memiliki pertanyaan, silakan hubungi tim dukungan kami.</p>
    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Imperium Crypto. All rights reserved.</p>
  </div>
</div>`

        await sendEmail({
          to: targetUser.email,
          subject: '[Imperium Crypto] Akun VIP Kamu Telah Diaktifkan',
          html: mailHtml,
        })

        return NextResponse.json({ success: true })
      }

      case 'deactivateVip': {
        const { userId } = body
        if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })

        // Transaksi Prisma untuk menonaktifkan status VIP
        await prisma.$transaction([
          prisma.profiles.update({
            where: { id: userId },
            data: { plan: 'free', plan_status: 'free' }
          }),
          prisma.data_member_vip.update({
            where: { id_user_auth: userId },
            data: { status_aktif: 'nonaktif' }
          })
        ])

        return NextResponse.json({ success: true })
      }

      case 'deleteUser': {
        const { ids } = body
        if (!ids || !Array.isArray(ids)) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

        // Mencegah penghapusan akun sendiri
        if (ids.includes(user.id)) {
          return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri!' }, { status: 400 })
        }

        // Hapus semua data relasi user di database menggunakan Prisma
        await prisma.$transaction([
          prisma.data_member_vip.deleteMany({ where: { id_user_auth: { in: ids } } }),
          prisma.data_pembayaran.deleteMany({ where: { id_user_auth: { in: ids } } }),
          prisma.notifications.deleteMany({ where: { user_id: { in: ids } } }),
          prisma.profiles.deleteMany({ where: { id: { in: ids } } })
        ])

        // Hapus akun dari sistem Supabase Auth (diperlukan menggunakan API admin service role Supabase)
        for (const id of ids) {
          try {
            await supabaseServer.auth.admin.deleteUser(id)
          } catch (authDelErr) {
            console.error(`Gagal menghapus user dari Supabase Auth untuk ID ${id}:`, authDelErr)
          }
        }

        return NextResponse.json({ success: true })
      }

      case 'confirmPayment': {
        const { paymentId } = body
        if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

        // Ambil rincian pembayaran pending menggunakan Prisma
        const payment = await prisma.data_pembayaran.findUnique({
          where: { id: paymentId }
        })

        if (!payment || !payment.id_user_auth) {
          return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
        }

        // Ambil durasi paket secara dinamis berdasarkan nama paket
        const paket = await prisma.data_paket_vip.findFirst({
          where: { nama_paket: payment.nama_paket }
        })

        const durationDays = paket ? paket.durasi_hari : 30
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + durationDays)

        // Konfirmasi pembayaran, update plan user ke VIP, sinkronisasi member VIP, dan kirim notifikasi via transaksi Prisma
        await prisma.$transaction([
          prisma.data_pembayaran.update({
            where: { id: paymentId },
            data: { status_pembayaran: 'success' }
          }),
          prisma.profiles.update({
            where: { id: payment.id_user_auth },
            data: { plan: 'vip', plan_status: 'vip' }
          }),
          prisma.data_member_vip.deleteMany({
            where: { id_user_auth: payment.id_user_auth }
          }),
          prisma.data_member_vip.create({
            data: {
              id_user_auth: payment.id_user_auth,
              email_member: payment.email_member,
              nama_paket: payment.nama_paket,
              harga_bayar: Number(payment.harga_bayar),
              status_aktif: 'aktif',
              kode_invite_unik: 'imperium-vip-invite',
              tanggal_berakhir: expiryDate
            }
          }),
          prisma.notifications.create({
            data: {
              user_id: payment.id_user_auth,
              title: 'Pembayaran Sukses!',
              message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
              type: 'success'
            }
          })
        ])

        // Dapatkan nama lengkap pengguna untuk keperluan pengiriman email
        const targetUser = await prisma.profiles.findUnique({
          where: { id: payment.id_user_auth },
          select: { full_name: true }
        })

        const expiryDateFormatted = expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        const mailHtml = `<div style="background-color: #000; color: #fff; font-family: sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #fbbf24; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Imperium Crypto</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase;">Payment Confirmed</p>
  </div>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 16px; margin: 0 0 12px;">Halo <strong>${targetUser?.full_name || payment.email_member}</strong>,</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px;">
      Pembayaran Anda untuk keanggotaan VIP Imperium telah berhasil dikonfirmasi oleh Admin. Akun VIP Anda kini telah aktif sepenuhnya!
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
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Status Pembayaran:</td>
          <td style="padding: 4px 0; text-align: right; color: #10b981; font-weight: bold; text-transform: uppercase;">SUCCESS/BERHASIL</td>
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
</div>`

        await sendEmail({
          to: payment.email_member,
          subject: '[Imperium Crypto] Pembayaran VIP Terkonfirmasi - Akun VIP Aktif!',
          html: mailHtml,
        })

        return NextResponse.json({ success: true })
      }

      case 'rejectPayment': {
        const { paymentId } = body
        if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

        // Dapatkan rincian pembayaran sebelum diupdate
        const payment = await prisma.data_pembayaran.findUnique({
          where: { id: paymentId }
        })

        if (!payment) {
          return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
        }

        // Tandai pembayaran sebagai gagal/ditolak
        await prisma.data_pembayaran.update({
          where: { id: paymentId },
          data: { status_pembayaran: 'failed' }
        })

        const targetUser = await prisma.profiles.findUnique({
          where: { id: payment.id_user_auth || undefined },
          select: { full_name: true }
        })

        const mailHtml = `<div style="background-color: #000; color: #fff; font-family: sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #type-red; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Imperium Crypto</h2>
    <p style="color: #6b7280; font-size: 12px; margin-top: 4px; text-transform: uppercase;">Payment Rejected</p>
  </div>
  <div style="margin-bottom: 24px;">
    <p style="font-size: 16px; margin: 0 0 12px;">Halo <strong>${targetUser?.full_name || payment.email_member}</strong>,</p>
    <p style="font-size: 14px; color: #d1d5db; line-height: 1.6; margin: 0 0 16px;">
      Mohon maaf, konfirmasi pembayaran Anda untuk paket <strong>${payment.nama_paket}</strong> telah ditolak oleh Admin karena bukti transfer tidak valid atau dana belum masuk.
    </p>
    <div style="background-color: #111; border: 1px solid #222; border-radius: 6px; padding: 16px; margin-bottom: 20px;">
      <table style="width: 100%; font-size: 13px; color: #9ca3af; border-collapse: collapse;">
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Nama Paket:</td>
          <td style="padding: 4px 0; text-align: right; color: #ef4444;">${payment.nama_paket}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Jumlah Bayar:</td>
          <td style="padding: 4px 0; text-align: right; color: #fff;">Rp ${Number(payment.harga_bayar).toLocaleString('id-ID')}</td>
        </tr>
        <tr>
          <td style="padding: 4px 0; font-weight: bold; color: #fff;">Status Pembayaran:</td>
          <td style="padding: 4px 0; text-align: right; color: #ef4444; font-weight: bold; text-transform: uppercase;">DITOLAK / GAGAL</td>
        </tr>
      </table>
    </div>
    <p style="font-size: 13px; color: #9ca3af; line-height: 1.6; margin: 0 0 16px;">
      Silakan periksa kembali bukti transfer Anda atau lakukan konfirmasi pembayaran baru melalui halaman upgrade. Jika Anda merasa ini adalah kesalahan, silakan hubungi tim Support kami di menu Bantuan.
    </p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/dashboard/upgrade" style="background-color: #ef4444; color: #fff; text-decoration: none; padding: 12px 24px; font-size: 14px; font-weight: bold; border-radius: 6px; display: inline-block; text-transform: uppercase; letter-spacing: 0.5px;">Coba Lagi / Upgrade</a>
    </div>
  </div>
  <hr style="border: 0; border-top: 1px solid #222; margin: 24px 0;" />
  <div style="text-align: center; font-size: 11px; color: #4b5563;">
    <p style="margin: 0 0 4px;">Surat ini dikirim secara otomatis. Silakan hubungi support jika perlu bantuan.</p>
    <p style="margin: 0;">&copy; ${new Date().getFullYear()} Imperium Crypto. All rights reserved.</p>
  </div>
</div>`

        await sendEmail({
          to: payment.email_member,
          subject: '[Imperium Crypto] Pembayaran VIP Ditolak',
          html: mailHtml,
        })

        return NextResponse.json({ success: true })
      }

      case 'updatePricingPlan': {
        const { planId, nama_paket, harga, durasi_hari, fitur } = body
        if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 })

        const parsedHarga = Number(harga)
        const parsedDurasi = Number(durasi_hari)

        if (isNaN(parsedHarga) || parsedHarga < 0) {
          return NextResponse.json({ error: 'Harga harus berupa angka positif' }, { status: 400 })
        }
        if (isNaN(parsedDurasi) || parsedDurasi <= 0) {
          return NextResponse.json({ error: 'Durasi hari harus berupa angka positif' }, { status: 400 })
        }

        const cleanedFitur = Array.isArray(fitur)
          ? fitur.map((f: unknown) => String(f).trim()).filter(Boolean)
          : []

        // Perbarui pricing plan lewat Prisma
        await prisma.data_paket_vip.update({
          where: { id: planId },
          data: {
            nama_paket,
            harga: parsedHarga,
            durasi_hari: parsedDurasi,
            fitur: cleanedFitur
          }
        })

        return NextResponse.json({ success: true })
      }

      case 'createPricingPlan': {
        const { nama_paket, harga, durasi_hari, fitur } = body

        const parsedHarga = Number(harga)
        const parsedDurasi = Number(durasi_hari)

        if (!nama_paket || String(nama_paket).trim() === '') {
          return NextResponse.json({ error: 'Nama paket wajib diisi' }, { status: 400 })
        }
        if (isNaN(parsedHarga) || parsedHarga < 0) {
          return NextResponse.json({ error: 'Harga harus berupa angka positif' }, { status: 400 })
        }
        if (isNaN(parsedDurasi) || parsedDurasi <= 0) {
          return NextResponse.json({ error: 'Durasi hari harus berupa angka positif' }, { status: 400 })
        }

        const cleanedFitur = Array.isArray(fitur)
          ? fitur.map((f: unknown) => String(f).trim()).filter(Boolean)
          : []

        // Buat pricing plan baru lewat Prisma
        await prisma.data_paket_vip.create({
          data: {
            nama_paket: String(nama_paket).trim(),
            harga: parsedHarga,
            durasi_hari: parsedDurasi,
            fitur: cleanedFitur
          }
        })

        return NextResponse.json({ success: true })
      }

      case 'updateSupportConfig': {
        const { config } = body
        if (!config) return NextResponse.json({ error: 'Missing config' }, { status: 400 })

        // Whitelist field konfigurasi yang diizinkan untuk update
        const allowedKeys = ['whatsapp_number', 'telegram_link', 'support_email', 'operational_hours']
        const filteredConfig: Record<string, string | null> = {}
        for (const key of allowedKeys) {
          if (config[key] !== undefined) {
            filteredConfig[key] = config[key]
          }
        }

        // Perbarui support config lewat Prisma
        await prisma.support_config.update({
          where: { id: 1 },
          data: filteredConfig
        })

        return NextResponse.json({ success: true })
      }

      case 'addFaq': {
        const { faq } = body
        if (!faq || !faq.question || !faq.answer) return NextResponse.json({ error: 'Missing faq details' }, { status: 400 })

        // Tambah FAQ lewat Prisma
        await prisma.support_faqs.create({
          data: {
            question: faq.question,
            answer: faq.answer,
            sort_order: Number(faq.sort_order) || 0
          }
        })

        return NextResponse.json({ success: true })
      }

      case 'deleteFaq': {
        const { faqId } = body
        if (!faqId) return NextResponse.json({ error: 'Missing faqId' }, { status: 400 })

        // Hapus FAQ lewat Prisma
        await prisma.support_faqs.delete({
          where: { id: faqId }
        })

        return NextResponse.json({ success: true })
      }

      case 'toggleSetting': {
        const { dbField, value } = body
        if (!dbField) return NextResponse.json({ error: 'Missing dbField' }, { status: 400 })

        // Toggle toggle setting lewat Prisma
        await prisma.admin_settings.update({
          where: { id: 1 },
          data: { [dbField]: value }
        })

        return NextResponse.json({ success: true })
      }

      case 'updateResendSettings': {
        const { apiKey, senderEmail } = body
        
        // Simpan setelan Resend lewat Prisma
        await prisma.admin_settings.update({
          where: { id: 1 },
          data: {
            resend_api_key: apiKey || null,
            resend_sender_email: senderEmail || null
          }
        })

        return NextResponse.json({ success: true })
      }

      case 'updateMidtransSettings': {
        const { clientKey, serverKey, publicKey, isProduction, upgradeMode } = body
        
        // Simpan setelan Midtrans lewat Prisma
        await prisma.admin_settings.update({
          where: { id: 1 },
          data: {
            midtrans_client_key: clientKey || null,
            midtrans_server_key: serverKey || null,
            midtrans_public_key: publicKey || null,
            midtrans_is_production: Boolean(isProduction),
            midtrans_upgrade_mode: upgradeMode || 'stacking'
          }
        })

        return NextResponse.json({ success: true })
      }

      case 'syncMidtransPaymentMethods': {
        // Ambil data server key Midtrans melalui Prisma
        const mtSettings = await prisma.admin_settings.findUnique({
          where: { id: 1 },
          select: {
            midtrans_server_key: true,
            midtrans_client_key: true,
            midtrans_is_production: true
          }
        })

        const sKey = mtSettings?.midtrans_server_key || '';
        const cKey = mtSettings?.midtrans_client_key || '';
        if (!sKey) {
          return NextResponse.json({ error: 'Server key Midtrans belum dikonfigurasi' }, { status: 400 })
        }

        const isProd = mtSettings?.midtrans_is_production === true;

        const probeResult = await paymentManager.probePaymentMethods('midtrans', {
          merchantCode: cKey,
          apiKey: sKey,
          sandbox: !isProd,
        });

        if (!probeResult.success) {
          return NextResponse.json({ error: probeResult.error || 'Gagal melakukan probe metode pembayaran' }, { status: 500 });
        }

        const enabled = probeResult.enabled;

        // Simpan daftar payment methods yang aktif ke database melalui Prisma
        await prisma.admin_settings.update({
          where: { id: 1 },
          data: { midtrans_enabled_payments: enabled as Prisma.InputJsonValue }
        });

        return NextResponse.json({ success: true, enabled });
      }

      case 'updateEnabledPayments': {
        const { enabledPayments } = body;
        if (!Array.isArray(enabledPayments)) {
          return NextResponse.json({ error: 'enabledPayments harus berupa array' }, { status: 400 });
        }

        // Perbarui enabled payments lewat Prisma
        await prisma.admin_settings.update({
          where: { id: 1 },
          data: { midtrans_enabled_payments: enabledPayments as Prisma.InputJsonValue }
        });

        return NextResponse.json({ success: true });
      }

      case 'getMembers': {
        // Ambil parameter paginasi dan filter dari body
        const { limit = 10, offset = 0, plan = 'all' } = body;
        
        // Membangun where clause berdasarkan filter plan
        const whereClause: { plan?: string } = {}
        if (plan && plan !== 'all') {
          whereClause.plan = plan;
        }

        // Query profil member dan total count secara paralel melalui Prisma transaction
        const [members, count] = await prisma.$transaction([
          prisma.profiles.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            skip: offset,
            take: limit
          }),
          prisma.profiles.count({
            where: whereClause
          })
        ])

        // Map data profiles agar created_at dikirim sebagai string ISO yang konsisten
        let enrichedMembers = members.map(m => ({
          ...m,
          created_at: m.created_at.toISOString()
        }));

        if (enrichedMembers.length > 0) {
          const userIds = enrichedMembers.map(m => m.id);
          
          // Ambil data aktivasi dan kadaluarsa VIP dari tabel data_member_vip menggunakan Prisma
          const vipData = await prisma.data_member_vip.findMany({
            where: { id_user_auth: { in: userIds } },
            select: { id_user_auth: true, created_at: true, tanggal_berakhir: true, nama_paket: true }
          })
          
          if (vipData && vipData.length > 0) {
            const vipMap = new Map(vipData.map(v => [v.id_user_auth, v]));
            enrichedMembers = enrichedMembers.map(m => {
              const vipInfo = vipMap.get(m.id);
              return {
                ...m,
                vip_activated_at: vipInfo?.created_at ? vipInfo.created_at.toISOString() : null,
                vip_expired_at: vipInfo?.tanggal_berakhir ? vipInfo.tanggal_berakhir.toISOString() : null,
                vip_plan_name: vipInfo ? vipInfo.nama_paket : null
              };
            });
          } else {
            enrichedMembers = enrichedMembers.map(m => ({
              ...m,
              vip_activated_at: null,
              vip_expired_at: null,
              vip_plan_name: null
            }));
          }
        }

        return NextResponse.json({ success: true, members: enrichedMembers, totalCount: count || 0 });
      }

      case 'getDashboardStats': {
        // Hitung total pengguna menggunakan Prisma
        const totalUser = await prisma.profiles.count()
        // Hitung total VIP aktif menggunakan Prisma
        const vipAktif = await prisma.profiles.count({
          where: { plan: 'vip' }
        })
        
        // Hitung omzet pembayaran sukses menggunakan agregasi Prisma
        const omzetAggregate = await prisma.data_pembayaran.aggregate({
          _sum: {
            harga_bayar: true
          },
          where: {
            status_pembayaran: 'success'
          }
        })
        const omzet = Number(omzetAggregate._sum.harga_bayar) || 0

        // Ambil transaksi sukses 7 hari terakhir untuk tren grafik harian
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
        const payments = await prisma.data_pembayaran.findMany({
          where: {
            status_pembayaran: 'success',
            created_at: { gte: sevenDaysAgo }
          },
          select: {
            harga_bayar: true,
            created_at: true
          }
        })

        // Format data payments agar created_at dikirim sebagai string ISO
        const formattedPayments = payments.map(p => ({
          harga_bayar: Number(p.harga_bayar),
          created_at: p.created_at ? p.created_at.toISOString() : null
        }))

        return NextResponse.json({
          success: true,
          stats: { totalUser, vipAktif, omzet },
          payments: formattedPayments
        })
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: unknown) {
    const err = error as Error
    console.error('Admin Action Error:', err)
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 })
  }
}
