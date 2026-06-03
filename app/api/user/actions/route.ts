import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'
import { prisma } from '@/lib/prisma'
import { calculateProratedPrice } from '@/lib/payment'

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
        const [profile, membership, settings] = await Promise.all([
          prisma.profiles.findUnique({
            where: { id: user.id },
            select: { full_name: true }
          }),
          prisma.data_member_vip.findUnique({
            where: { id_user_auth: user.id }
          }),
          prisma.admin_settings.findUnique({
            where: { id: 1 },
            select: {
              discord_vip_server_id: true,
              discord_free_invite_link: true
            }
          })
        ]);

        // Tautan langsung ke server VIP dibuat dinamis dari server ID agar aman dari kebocoran link invite
        const vipServerId = settings?.discord_vip_server_id || process.env.DISCORD_VIP_SERVER_ID || process.env.DISCORD_VIP_GUILD_ID;
        const vipInviteLink = vipServerId
          ? `https://discord.com/channels/${vipServerId}`
          : '#';

        return NextResponse.json({ 
          profile, 
          membership,
          freeInviteLink: settings?.discord_free_invite_link || process.env.DISCORD_FREE_INVITE_LINK || '#',
          vipInviteLink
        });
      }

      case 'getGroupData': {
        const [profile, vipData, supportRes, settings] = await Promise.all([
          prisma.profiles.findUnique({
            where: { id: user.id },
            select: { plan: true }
          }),
          prisma.data_member_vip.findUnique({
            where: { id_user_auth: user.id },
            select: { kode_invite_unik: true, id_discord_user: true }
          }),
          prisma.support_config.findUnique({
            where: { id: 1 },
            select: { telegram_link: true }
          }),
          prisma.admin_settings.findUnique({
            where: { id: 1 },
            select: {
              discord_vip_server_id: true,
              discord_free_invite_link: true
            }
          })
        ]);

        // Tautan langsung ke server VIP dibuat dinamis dari server ID agar aman dari kebocoran link invite
        const vipServerId = settings?.discord_vip_server_id || process.env.DISCORD_VIP_SERVER_ID || process.env.DISCORD_VIP_GUILD_ID;
        const vipInviteLink = vipServerId
          ? `https://discord.com/channels/${vipServerId}`
          : '#';

        return NextResponse.json({ 
          profile, 
          vipData, 
          telegramLink: supportRes?.telegram_link || '#',
          freeInviteLink: settings?.discord_free_invite_link || process.env.DISCORD_FREE_INVITE_LINK || '#',
          vipInviteLink
        });
      }

      case 'getProfileData': {
        const [profile, vipData] = await Promise.all([
          prisma.profiles.findUnique({
            where: { id: user.id },
            select: { full_name: true, whatsapp_number: true, plan: true, created_at: true }
          }),
          prisma.data_member_vip.findUnique({
            where: { id_user_auth: user.id },
            select: { 
              status_aktif: true, 
              tanggal_berakhir: true,
              id_discord_user: true,
              kode_invite_unik: true,
              nama_paket: true,
              harga_bayar: true,
              created_at: true
            }
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

        const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking'
        const currentMember = upgradeMode === 'proration'
          ? await prisma.data_member_vip.findUnique({ where: { id_user_auth: user.id } })
          : null

        const finalPrice = calculateProratedPrice(currentMember, Number(plan.harga), upgradeMode)

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
