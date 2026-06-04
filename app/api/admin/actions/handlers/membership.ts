import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { calculateProratedPrice } from '@/lib/payment'
import { getVipActivationEmailHtml } from '@/lib/emailTemplates'
import { getAdminSettings } from '@/lib/adminSettings'

interface MembershipBody {
  userId?: string
  planId?: string
  limit?: number
  offset?: number
  plan?: string
}

/**
 * Menangani upgrade manual pengguna ke VIP.
 */
export async function upgradeManual(body: MembershipBody): Promise<Response> {
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

  // Ambil setelan Midtrans dari cache untuk mendapatkan upgrade mode
  const settings = await getAdminSettings()
  const upgradeMode = settings?.midtrans_upgrade_mode || 'stacking'

  let baseDate = new Date()
  const planHarga = Number(plan.harga)
  const finalAmount = calculateProratedPrice(currentMember, planHarga, upgradeMode)

  if (upgradeMode !== 'proration') {
    // Stacking mode: perpanjang masa aktif dari tanggal berakhir sebelumnya jika di masa depan
    if (currentMember && (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && currentMember.tanggal_berakhir) {
      const currentExpiry = new Date(currentMember.tanggal_berakhir)
      if (currentExpiry > baseDate) {
        baseDate = currentExpiry
      }
    }
  }

  const expiryDate = new Date(baseDate)
  expiryDate.setDate(expiryDate.getDate() + plan.durasi_hari)

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

  // Kirim email notifikasi menggunakan email templates modular
  const expiryDateFormatted = expiryDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  const mailHtml = getVipActivationEmailHtml(targetUser.full_name || targetUser.email, expiryDateFormatted)

  await sendEmail({
    to: targetUser.email,
    subject: '[Imperium Crypto] Akun VIP Kamu Telah Diaktifkan',
    html: mailHtml,
  })

  return NextResponse.json({ success: true })
}

/**
 * Menonaktifkan status VIP pengguna.
 */
export async function deactivateVip(body: MembershipBody): Promise<Response> {
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

/**
 * Mengambil daftar member ter-enriched dengan pagination dan filter.
 */
export async function getMembers(body: MembershipBody): Promise<Response> {
  const { limit = 10, offset = 0, plan = 'all' } = body
  
  // Membangun where clause berdasarkan filter plan
  const whereClause: { plan?: string } = {}
  if (plan && plan !== 'all') {
    whereClause.plan = plan
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
  }))

  if (enrichedMembers.length > 0) {
    const userIds = enrichedMembers.map(m => m.id)
    
    // Ambil data aktivasi, kadaluarsa VIP, status aktif, dan ID Discord dari tabel data_member_vip menggunakan Prisma
    const vipData = await prisma.data_member_vip.findMany({
      where: { id_user_auth: { in: userIds } },
      select: { 
        id_user_auth: true, 
        created_at: true, 
        tanggal_berakhir: true, 
        nama_paket: true,
        id_discord_user: true,
        status_aktif: true 
      }
    })

    // Ambil setelan admin untuk bot token dan server ID Discord dari cache
    const adminSettings = await getAdminSettings()
    const botToken = adminSettings?.discord_bot_token || process.env.DISCORD_BOT_TOKEN
    const vipGuildId = adminSettings?.discord_vip_server_id || process.env.DISCORD_VIP_SERVER_ID

    if (vipData && vipData.length > 0) {
      const vipMap = new Map(vipData.map(v => [v.id_user_auth, v]))
      
      // Ambil status Discord secara paralel dengan Promise.all
      enrichedMembers = await Promise.all(enrichedMembers.map(async (m) => {
        const vipInfo = vipMap.get(m.id)
        const discordUserId = vipInfo?.id_discord_user
        
        let discordStatus = 'no_discord' // Default: belum menghubungkan Discord
        
        if (discordUserId && botToken && vipGuildId) {
          try {
            const discordRes = await fetch(`https://discord.com/api/guilds/${vipGuildId}/members/${discordUserId}`, {
              headers: {
                Authorization: `Bot ${botToken}`
              }
            })
            
            if (discordRes.ok) {
              discordStatus = 'joined' // Sudah bergabung ke server
            } else if (discordRes.status === 404) {
              // Jika status_aktif adalah 'hangus' atau 'nonaktif', berarti telah di-kick
              if (vipInfo?.status_aktif === 'hangus' || vipInfo?.status_aktif === 'nonaktif') {
                discordStatus = 'kicked' // Sudah di-kick / keluar (karena expired)
              } else {
                discordStatus = 'not_joined' // Belum join ke server (walau sudah menghubungkan)
              }
            } else {
              discordStatus = 'error'
            }
          } catch {
            discordStatus = 'error'
          }
        }
        
        return {
          ...m,
          vip_activated_at: vipInfo?.created_at ? vipInfo.created_at.toISOString() : null,
          vip_expired_at: vipInfo?.tanggal_berakhir ? vipInfo.tanggal_berakhir.toISOString() : null,
          vip_plan_name: vipInfo ? vipInfo.nama_paket : null,
          id_discord_user: discordUserId || null,
          vip_status_aktif: vipInfo?.status_aktif || null,
          discord_status: discordStatus
        }
      }))
    } else {
      enrichedMembers = enrichedMembers.map(m => ({
        ...m,
        vip_activated_at: null,
        vip_expired_at: null,
        vip_plan_name: null,
        id_discord_user: null,
        vip_status_aktif: null,
        discord_status: 'no_discord'
      }))
    }
  }

  return NextResponse.json({ success: true, members: enrichedMembers, totalCount: count || 0 })
}
