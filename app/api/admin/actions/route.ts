import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'
import { supabaseServer } from '@/lib/supabaseServer'
import { sendEmail } from '@/lib/email'
import { paymentManager } from '@crediblemark/buayar'

export async function POST(request: Request) {
  try {
    // 1. Authenticate user using client session cookies
    const clientSupabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Verify admin role on server side using service role
    const { data: profile, error: profileError } = await supabaseServer
      .from('profiles')
      .select('plan')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.plan !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // 3. Process the admin action
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'upgradeManual': {
        const { userId, planId } = body
        if (!userId) return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
        if (!planId) return NextResponse.json({ error: 'Missing planId' }, { status: 400 })
        
        // Get target user details to copy email/name
        const { data: targetUser, error: targetErr } = await supabaseServer
          .from('profiles')
          .select('email, full_name')
          .eq('id', userId)
          .single()
        
        if (targetErr || !targetUser) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        // Get plan details dynamically
        const { data: plan, error: planErr } = await supabaseServer
          .from('data_paket_vip')
          .select('*')
          .eq('id', planId)
          .single()

        if (planErr || !plan) {
          return NextResponse.json({ error: 'Pricing plan not found' }, { status: 404 })
        }

        // Fetch current active member details (needed for proration check)
        const { data: currentMember } = await supabaseServer
          .from('data_member_vip')
          .select('*')
          .eq('id_user_auth', userId)
          .maybeSingle() as any;

        // Fetch Midtrans settings from database to get upgrade mode
        const { data: settings } = await supabaseServer
          .from('admin_settings')
          .select('midtrans_upgrade_mode')
          .eq('id', 1)
          .maybeSingle() as any;
        const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking';

        let baseDate = new Date();
        let finalAmount = plan.harga;

        if (upgradeMode === 'proration') {
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

              finalAmount = Math.max(10000, plan.harga - remainingValue);
            }
          }
        } else {
          // Stacking mode: extend from existing expiry date if future
          if (currentMember && (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && currentMember.tanggal_berakhir) {
            const currentExpiry = new Date(currentMember.tanggal_berakhir);
            if (currentExpiry > baseDate) {
              baseDate = currentExpiry;
            }
          }
        }

        const expiryDate = new Date(baseDate);
        expiryDate.setDate(expiryDate.getDate() + plan.durasi_hari);

        // Update profiles to vip
        const { error: profErr } = await supabaseServer
          .from('profiles')
          .update({ plan: 'vip', plan_status: 'vip' })
          .eq('id', userId);
        if (profErr) throw profErr;

        // Sync VIP membership details
        await supabaseServer.from('data_member_vip').delete().eq('id_user_auth', userId);
        const { error: vipErr } = await supabaseServer
          .from('data_member_vip')
          .insert({
            id_user_auth: userId,
            email_member: targetUser.email,
            nama_paket: plan.nama_paket,
            harga_bayar: finalAmount,
            status_aktif: 'aktif',
            kode_invite_unik: 'imperium-vip-invite',
            tanggal_berakhir: expiryDate.toISOString()
          });

        if (vipErr) throw vipErr;


        // Send Email Notification
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

        // Revert profiles to free
        const { error: profErr } = await supabaseServer
          .from('profiles')
          .update({ plan: 'free', plan_status: 'free' })
          .eq('id', userId)
        if (profErr) throw profErr

        // Update VIP active status to nonaktif
        const { error: vipErr } = await supabaseServer
          .from('data_member_vip')
          .update({ status_aktif: 'nonaktif' })
          .eq('id_user_auth', userId)
        if (vipErr) throw vipErr

        return NextResponse.json({ success: true })
      }

      case 'deleteUser': {
        const { ids } = body
        if (!ids || !Array.isArray(ids)) return NextResponse.json({ error: 'Missing ids' }, { status: 400 })

        // Prevent self deletion
        if (ids.includes(user.id)) {
          return NextResponse.json({ error: 'Anda tidak dapat menghapus akun Anda sendiri!' }, { status: 400 })
        }

        // Clear user data from related tables
        await supabaseServer.from('data_member_vip').delete().in('id_user_auth', ids)
        await supabaseServer.from('data_pembayaran').delete().in('id_user_auth', ids)
        await supabaseServer.from('notifications').delete().in('user_id', ids)

        // Delete from profiles table
        const { error: profErr } = await supabaseServer.from('profiles').delete().in('id', ids)
        if (profErr) throw profErr

        // Delete users from Supabase Auth system to prevent orphaned accounts
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

        // Fetch pending payment details
        const { data: payment, error: payGetErr } = await supabaseServer
          .from('data_pembayaran')
          .select('*')
          .eq('id', paymentId)
          .single()

        if (payGetErr || !payment) {
          return NextResponse.json({ error: 'Payment record not found' }, { status: 404 })
        }

        // Fetch dynamic package duration from data_paket_vip
        const { data: paket } = await supabaseServer
          .from('data_paket_vip')
          .select('durasi_hari')
          .eq('nama_paket', payment.nama_paket)
          .single()

        const durationDays = paket ? paket.durasi_hari : 30
        const expiryDate = new Date()
        expiryDate.setDate(expiryDate.getDate() + durationDays)

        // 1. Update Status Pembayaran
        const { error: payErr } = await supabaseServer
          .from('data_pembayaran')
          .update({ status_pembayaran: 'success' })
          .eq('id', paymentId)
        if (payErr) throw payErr

        // 2. Update Plan di Profiles
        const { error: profErr } = await supabaseServer
          .from('profiles')
          .update({ plan: 'vip', plan_status: 'vip' })
          .eq('id', payment.id_user_auth)
        if (profErr) throw profErr

        // 3. Sync ke Data Member VIP
        await supabaseServer.from('data_member_vip').delete().eq('id_user_auth', payment.id_user_auth)
        const { error: vipErr } = await supabaseServer
          .from('data_member_vip')
          .insert({
            id_user_auth: payment.id_user_auth,
            email_member: payment.email_member,
            nama_paket: payment.nama_paket,
            harga_bayar: payment.harga_bayar,
            status_aktif: 'aktif',
            kode_invite_unik: 'imperium-vip-invite',
            tanggal_berakhir: expiryDate.toISOString()
          })
        if (vipErr) throw vipErr

        // 4. Send Success Notification
        await supabaseServer.from('notifications').insert({
          user_id: payment.id_user_auth,
          title: 'Pembayaran Sukses!',
          message: 'Selamat! Akun VIP Imperium kamu sudah aktif.',
          type: 'success'
        })

        // Fetch user full_name for email
        const { data: targetUser } = await supabaseServer
          .from('profiles')
          .select('full_name')
          .eq('id', payment.id_user_auth)
          .single()

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
          subject: '[Imperium Crypto] Pembayaran Terkonfirmasi - Akun VIP Aktif!',
          html: mailHtml,
        })

        return NextResponse.json({ success: true })
      }

      case 'rejectPayment': {
        const { paymentId } = body
        if (!paymentId) return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 })

        // Fetch details before updating
        const { data: payment } = await supabaseServer
          .from('data_pembayaran')
          .select('*')
          .eq('id', paymentId)
          .single()

        const { error: payErr } = await supabaseServer
          .from('data_pembayaran')
          .update({ status_pembayaran: 'failed' })
          .eq('id', paymentId)
        if (payErr) throw payErr

        if (payment) {
          const { data: targetUser } = await supabaseServer
            .from('profiles')
            .select('full_name')
            .eq('id', payment.id_user_auth)
            .single()

          const mailHtml = `<div style="background-color: #000; color: #fff; font-family: sans-serif; padding: 24px; border-radius: 8px; max-width: 600px; margin: 0 auto; border: 1px solid #333;">
  <div style="text-align: center; margin-bottom: 24px;">
    <h2 style="color: #ef4444; font-size: 24px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">Imperium Crypto</h2>
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
        }

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
          ? fitur.map((f: any) => String(f).trim()).filter(Boolean)
          : []

        const { error: planErr } = await supabaseServer
          .from('data_paket_vip')
          .update({
            nama_paket,
            harga: parsedHarga,
            durasi_hari: parsedDurasi,
            fitur: cleanedFitur
          })
          .eq('id', planId)
        if (planErr) throw planErr

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
          ? fitur.map((f: any) => String(f).trim()).filter(Boolean)
          : []

        const { error: planErr } = await supabaseServer
          .from('data_paket_vip')
          .insert({
            nama_paket: String(nama_paket).trim(),
            harga: parsedHarga,
            durasi_hari: parsedDurasi,
            fitur: cleanedFitur
          })
        if (planErr) throw planErr

        return NextResponse.json({ success: true })
      }

      case 'updateSupportConfig': {
        const { config } = body
        if (!config) return NextResponse.json({ error: 'Missing config' }, { status: 400 })

        // Whitelist allowed fields to prevent arbitrary column updates or primary key changes
        const allowedKeys = ['whatsapp_number', 'telegram_link', 'support_email', 'operational_hours']
        const filteredConfig: Record<string, any> = {}
        for (const key of allowedKeys) {
          if (config[key] !== undefined) {
            filteredConfig[key] = config[key]
          }
        }

        const { error: configErr } = await supabaseServer
          .from('support_config')
          .update(filteredConfig)
          .eq('id', 1)
        if (configErr) throw configErr

        return NextResponse.json({ success: true })
      }

      case 'addFaq': {
        const { faq } = body
        if (!faq || !faq.question || !faq.answer) return NextResponse.json({ error: 'Missing faq details' }, { status: 400 })

        const { error: faqErr } = await supabaseServer
          .from('support_faqs')
          .insert([faq])
        if (faqErr) throw faqErr

        return NextResponse.json({ success: true })
      }

      case 'deleteFaq': {
        const { faqId } = body
        if (!faqId) return NextResponse.json({ error: 'Missing faqId' }, { status: 400 })

        const { error: faqErr } = await supabaseServer
          .from('support_faqs')
          .delete()
          .eq('id', faqId)
        if (faqErr) throw faqErr

        return NextResponse.json({ success: true })
      }

      case 'toggleSetting': {
        const { dbField, value } = body
        if (!dbField) return NextResponse.json({ error: 'Missing dbField' }, { status: 400 })

        const { error: settingErr } = await supabaseServer
          .from('admin_settings')
          .update({ [dbField]: value })
          .eq('id', 1)
        if (settingErr) throw settingErr

        return NextResponse.json({ success: true })
      }

      case 'updateResendSettings': {
        const { apiKey, senderEmail } = body
        const { error: settingErr } = await supabaseServer
          .from('admin_settings')
          .update({
            resend_api_key: apiKey || null,
            resend_sender_email: senderEmail || null
          })
          .eq('id', 1)
        if (settingErr) throw settingErr

        return NextResponse.json({ success: true })
      }

      case 'updateMidtransSettings': {
        const { clientKey, serverKey, publicKey, isProduction, upgradeMode } = body
        const { error: settingErr } = await supabaseServer
          .from('admin_settings')
          .update({
            midtrans_client_key: clientKey || null,
            midtrans_server_key: serverKey || null,
            midtrans_public_key: publicKey || null,
            midtrans_is_production: Boolean(isProduction),
            midtrans_upgrade_mode: upgradeMode || 'stacking'
          })
          .eq('id', 1)
        if (settingErr) throw settingErr

        return NextResponse.json({ success: true })
      }


      case 'syncMidtransPaymentMethods': {
        // Probe Midtrans Core API to discover which payment types are actually enabled
        const { data: mtSettings } = await supabaseServer
          .from('admin_settings')
          .select('midtrans_server_key, midtrans_client_key, midtrans_is_production')
          .eq('id', 1)
          .maybeSingle() as any;

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

        // Save enabled methods to database
        const { error: saveErr } = await supabaseServer
          .from('admin_settings')
          .update({ midtrans_enabled_payments: enabled as any })
          .eq('id', 1);
        if (saveErr) throw saveErr;

        return NextResponse.json({ success: true, enabled });
      }


      case 'updateEnabledPayments': {
        const { enabledPayments } = body;
        if (!Array.isArray(enabledPayments)) {
          return NextResponse.json({ error: 'enabledPayments harus berupa array' }, { status: 400 });
        }

        const { error: saveErr } = await supabaseServer
          .from('admin_settings')
          .update({ midtrans_enabled_payments: enabledPayments as any })
          .eq('id', 1);
        if (saveErr) throw saveErr;

        return NextResponse.json({ success: true });
      }

      case 'getMembers': {
        const { data: members, error } = await supabaseServer
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json({ success: true, members });
      }

      default:
        return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
    }
  } catch (error: any) {
    console.error('Admin Action Error:', error)
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 })
  }
}

