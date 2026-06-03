import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Route API Cron Job untuk memeriksa keanggotaan VIP yang kedaluwarsa.
 * Mengubah status ke 'hangus', mereset profil ke 'free', dan menendang (kick) user dari server Discord VIP.
 */
export async function GET(request: Request) {
  try {
    // 1. Verifikasi Keamanan Request (Vercel Cron Header atau Authorization Bearer)
    const isVercelCron = request.headers.get('x-vercel-cron') === '1'
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    const isAuthorized =
      isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`)

    if (!isAuthorized) {
      console.warn('Cron Check Subscriptions: Unauthorized attempt.')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // 2. Ambil parameter Discord untuk proses auto-kick dari Server VIP
    const botToken = process.env.DISCORD_BOT_TOKEN
    const vipGuildId = process.env.DISCORD_VIP_SERVER_ID || process.env.DISCORD_VIP_GUILD_ID

    if (!botToken || !vipGuildId) {
      console.error('Cron Check Subscriptions: Discord Bot Token or VIP Guild ID is not configured.')
      return NextResponse.json(
        { error: 'Konfigurasi Discord API tidak lengkap di server.' },
        { status: 500 }
      )
    }

    // 3. Kueri data VIP yang sudah berakhir masa berlakunya dan statusnya masih aktif
    const now = new Date()
    const expiredMembers = await prisma.data_member_vip.findMany({
      where: {
        tanggal_berakhir: {
          lte: now
        },
        status_aktif: {
          in: ['aktif', 'vip']
        }
      }
    })

    console.log(`Cron Check Subscriptions: Menemukan ${expiredMembers.length} member VIP kedaluwarsa.`)

    const results = []

    // 4. Proses pembersihan data dan auto-kick masing-masing member
    for (const member of expiredMembers) {
      const userId = member.id_user_auth
      const discordUserId = member.id_discord_user

      let kickSuccess = false
      let kickErrorLog = ''

      // Jalankan kick Discord jika user sudah menghubungkan akun Discord-nya
      if (discordUserId) {
        try {
          const discordRes = await fetch(
            `https://discord.com/api/guilds/${vipGuildId}/members/${discordUserId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bot ${botToken}`
              }
            }
          )

          if (discordRes.ok || discordRes.status === 404) {
            // Sukses kick, atau user memang sudah keluar server secara manual sebelumnya (404)
            kickSuccess = true
            console.log(`Cron Discord Kick: Sukses mengeluarkan Discord ID ${discordUserId} (${member.email_member})`)
          } else {
            const errorMsg = await discordRes.text()
            kickErrorLog = `HTTP ${discordRes.status}: ${errorMsg}`
            console.error(`Cron Discord Kick Error: Gagal kick Discord ID ${discordUserId}.`, kickErrorLog)
          }
        } catch (discordErr) {
          const err = discordErr as Error
          kickErrorLog = err.message
          console.error(`Cron Discord Kick Exception: Error saat kick Discord ID ${discordUserId}.`, err)
        }
      } else {
        kickErrorLog = 'Akun Discord tidak terhubung.'
      }

      // Perbarui database untuk member ini secara atomik
      try {
        await prisma.$transaction([
          // Ubah status keanggotaan VIP menjadi 'hangus'
          prisma.data_member_vip.update({
            where: { id: member.id },
            data: { status_aktif: 'hangus' }
          }),
          // Kembalikan status plan profil user menjadi 'free' (biarkan discord_joined tetap true karena mereka masih di Server Free)
          prisma.profiles.update({
            where: { id: userId },
            data: {
              plan: 'free',
              plan_status: 'free'
            }
          }),
          // Berikan notifikasi sistem ke user terkait berakhirnya VIP
          prisma.notifications.create({
            data: {
              user_id: userId,
              title: 'Akses VIP Berakhir',
              message: 'Masa berlangganan VIP kamu telah habis. Akses ke server Discord VIP dan sinyal trading telah dinonaktifkan.',
              type: 'alert'
            }
          })
        ])

        results.push({
          email: member.email_member,
          userId: userId,
          discordId: discordUserId,
          kickSuccess,
          error: kickErrorLog || undefined
        })
      } catch (dbErr) {
        console.error(`Cron DB Update Error: Gagal memperbarui status user ${userId} di DB.`, dbErr)
      }
    }

    return NextResponse.json({
      success: true,
      processed: results.length,
      details: results
    })

  } catch (err: unknown) {
    const error = err as Error
    console.error('Cron Check Subscriptions Internal Error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal pada cron checker.' },
      { status: 500 }
    )
  }
}
