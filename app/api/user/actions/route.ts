import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // 1. Otentikasi pengguna secara server-side
    const clientSupabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Parse body request
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'getDashboardData': {
        const [profile, membership] = await Promise.all([
          prisma.profiles.findUnique({
            where: { id: user.id },
            select: { full_name: true }
          }),
          prisma.data_member_vip.findUnique({
            where: { id_user_auth: user.id }
          })
        ])

        return NextResponse.json({ profile, membership })
      }

      case 'getGroupData': {
        const [profile, vipData, supportRes] = await Promise.all([
          prisma.profiles.findUnique({
            where: { id: user.id },
            select: { plan: true }
          }),
          prisma.data_member_vip.findUnique({
            where: { id_user_auth: user.id },
            select: { kode_invite_unik: true }
          }),
          prisma.support_config.findUnique({
            where: { id: 1 },
            select: { telegram_link: true }
          })
        ])

        return NextResponse.json({ profile, vipData, telegramLink: supportRes?.telegram_link || '#' })
      }

      case 'getProfileData': {
        const [profile, vipData] = await Promise.all([
          prisma.profiles.findUnique({
            where: { id: user.id },
            select: { full_name: true, whatsapp_number: true, plan: true }
          }),
          prisma.data_member_vip.findUnique({
            where: { id_user_auth: user.id },
            select: { status_aktif: true, tanggal_berakhir: true }
          })
        ])

        return NextResponse.json({ profile, vipData })
      }

      case 'updateProfile': {
        const { fullName, whatsappNumber } = body
        if (!fullName) {
          return NextResponse.json({ error: 'Nama lengkap wajib diisi' }, { status: 400 })
        }

        await prisma.profiles.update({
          where: { id: user.id },
          data: {
            full_name: fullName,
            whatsapp_number: whatsappNumber || ''
          }
        })

        return NextResponse.json({ success: true })
      }

      case 'getSupportPageData': {
        const [config, faqs] = await Promise.all([
          prisma.support_config.findUnique({
            where: { id: 1 }
          }),
          prisma.support_faqs.findMany({
            orderBy: { sort_order: 'asc' }
          })
        ])

        return NextResponse.json({ config, faqs })
      }

      case 'getUpgradeData': {
        const [paketList, memberData, configData] = await Promise.all([
          prisma.data_paket_vip.findMany({
            orderBy: { harga: 'asc' }
          }),
          prisma.data_member_vip.findUnique({
            where: { id_user_auth: user.id }
          }),
          prisma.admin_settings.findUnique({
            where: { id: 1 },
            select: { midtrans_upgrade_mode: true }
          })
        ])

        return NextResponse.json({
          paketList,
          memberData,
          upgradeMode: configData?.midtrans_upgrade_mode || 'stacking'
        })
      }

      case 'submitManualPayment': {
        const { planId, publicUrl } = body
        if (!planId || !publicUrl) {
          return NextResponse.json({ error: 'Data pembayaran kurang lengkap' }, { status: 400 })
        }

        // Cari detail paket VIP secara dinamis menggunakan Prisma
        const plan = await prisma.data_paket_vip.findUnique({
          where: { id: planId }
        })

        if (!plan) {
          return NextResponse.json({ error: 'Paket VIP tidak ditemukan' }, { status: 404 })
        }

        // Kalkulasi harga prorasi jika setelan aktif
        const settings = await prisma.admin_settings.findUnique({
          where: { id: 1 },
          select: { midtrans_upgrade_mode: true }
        })

        let finalPrice = Number(plan.harga)

        if (settings?.midtrans_upgrade_mode === 'proration') {
          const currentMember = await prisma.data_member_vip.findUnique({
            where: { id_user_auth: user.id }
          })

          if (currentMember && (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && currentMember.tanggal_berakhir) {
            const today = new Date()
            const expiry = new Date(currentMember.tanggal_berakhir)

            if (expiry > today) {
              const created = currentMember.created_at || new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
              let totalDays = Math.ceil((expiry.getTime() - created.getTime()) / (24 * 60 * 60 * 1000))
              if (totalDays <= 0) totalDays = 30

              let remainingDays = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
              if (remainingDays < 0) remainingDays = 0

              const oldPaidAmount = Number(currentMember.harga_bayar) || 0
              const remainingValue = oldPaidAmount * (remainingDays / totalDays)

              finalPrice = Math.max(10000, Number(plan.harga) - remainingValue)
            }
          }
        }

        // Simpan data bukti transfer secara aman via Prisma
        await prisma.data_pembayaran.create({
          data: {
            id_user_auth: user.id,
            email_member: user.email || '',
            nama_paket: plan.nama_paket,
            harga_bayar: finalPrice,
            bukti_transfer: publicUrl,
            status_pembayaran: 'pending'
          }
        })

        return NextResponse.json({ success: true })
      }

      case 'getNotifications': {
        const notifs = await prisma.notifications.findMany({
          where: {
            OR: [
              { user_id: user.id },
              { user_id: null }
            ]
          },
          orderBy: { created_at: 'desc' },
          take: 10
        })

        return NextResponse.json({ notifications: notifs })
      }

      case 'markNotificationsAsRead': {
        await prisma.notifications.updateMany({
          where: {
            user_id: user.id,
            is_read: false
          },
          data: {
            is_read: true
          }
        })

        return NextResponse.json({ success: true })
      }

      case 'getUserPlan': {
        const profile = await prisma.profiles.findUnique({
          where: { id: user.id },
          select: { plan: true }
        })

        return NextResponse.json({ plan: profile?.plan || 'free' })
      }

      default: {
        return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 })
      }
    }
  } catch (err: unknown) {
    const error = err as Error
    console.error('Error User Action:', error)
    return NextResponse.json({ error: error.message || 'Terjadi kesalahan sistem' }, { status: 500 })
  }
}
