import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'
import { prisma } from '@/lib/prisma'

/**
 * Route API Callback OAuth2 Discord.
 * Memproses kode otorisasi dari Discord, menukarnya dengan access token,
 * mendaftarkan user ke Server Discord, memberikan role VIP, dan memperbarui DB.
 */
export async function GET(request: Request) {
  // Deteksi domain asal secara aman (mendukung proxy, localtunnel, dan Cloudflare Tunnel)
  const host = request.headers.get('x-forwarded-host') || new URL(request.url).host
  const proto = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.replace(':', '')
  let baseUrl = `${proto}://${host}`

  // Ambil data konfigurasi dari database
  const settings = await prisma.admin_settings.findUnique({
    where: { id: 1 }
  })

  // Gunakan origin dari DISCORD_REDIRECT_URI jika tersedia sebagai prioritas utama
  const redirectUriVal = settings?.discord_redirect_uri || process.env.DISCORD_REDIRECT_URI
  if (redirectUriVal) {
    try {
      baseUrl = new URL(redirectUriVal).origin
    } catch {
      // Abaikan jika format URI salah
    }
  }

  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    // Jika pengguna menolak otorisasi atau terjadi error dari Discord
    if (errorParam || !code) {
      console.warn('Discord Auth Callback: Otorisasi ditolak oleh user atau code tidak ada.', errorParam)
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=auth_denied', baseUrl))
    }

    // 1. Validasi sesi pengguna Supabase secara server-side
    const clientSupabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      console.error('Discord Auth Callback: Sesi pengguna tidak valid.', authError)
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=unauthorized', baseUrl))
    }

    // 2. Periksa status keanggotaan VIP pengguna di database
    const memberVip = await prisma.data_member_vip.findUnique({
      where: { id_user_auth: user.id }
    })

    const isVip = memberVip?.status_aktif === 'aktif' || memberVip?.status_aktif === 'vip'

    // 3. Ambil konfigurasi Discord
    const clientId = settings?.discord_application_id || process.env.DISCORD_APPLICATION_ID || process.env.DISCORD_CLIENT_ID
    const clientSecret = settings?.discord_client_secret || process.env.DISCORD_CLIENT_SECRET
    const botToken = settings?.discord_bot_token || process.env.DISCORD_BOT_TOKEN
    const vipGuildId = settings?.discord_vip_server_id || process.env.DISCORD_VIP_SERVER_ID || process.env.DISCORD_VIP_GUILD_ID
    const vipRoleId = settings?.discord_vip_role_id || process.env.DISCORD_VIP_ROLE_ID
    const redirectUri = settings?.discord_redirect_uri || process.env.DISCORD_REDIRECT_URI

    // Wajib ada: clientId, clientSecret, botToken, vipGuildId, dan redirectUri
    if (!clientId || !clientSecret || !botToken || !vipGuildId || !redirectUri || vipGuildId.includes('PASTE_DISCORD_VIP_SERVER_ID_HERE')) {
      console.error('Discord Auth Callback: Konfigurasi wajib Discord API tidak lengkap di database atau .env.')
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=config_missing', baseUrl))
    }

    // 4. Tukarkan 'code' dengan Access Token Discord
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      }).toString()
    })

    if (!tokenResponse.ok) {
      const tokenError = await tokenResponse.text()
      console.error('Discord Auth Callback: Gagal menukar kode otorisasi.', tokenError)
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=token_exchange_failed', baseUrl))
    }

    const tokenData = await tokenResponse.json()
    const userAccessToken = tokenData.access_token

    // 5. Ambil data profil Discord milik pengguna (@me)
    const userProfileResponse = await fetch('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${userAccessToken}`
      }
    })

    if (!userProfileResponse.ok) {
      const profileError = await userProfileResponse.text()
      console.error('Discord Auth Callback: Gagal mengambil profil user Discord.', profileError)
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=profile_fetch_failed', baseUrl))
    }

    const userProfile = await userProfileResponse.json()
    const discordUserId = userProfile.id
    const discordUsername = userProfile.username

    // 6. Masukkan pengguna ke server yang sesuai
    // Masukkan ke Server VIP (Hanya jika pengguna berstatus VIP aktif)
    if (isVip) {
      console.log(`Discord Auth Callback: Memasukkan ${discordUsername} ke Server VIP (${vipGuildId})...`)
      
      const hasVipRole = vipRoleId && !vipRoleId.includes('PASTE_DISCORD_VIP_ROLE_ID_HERE')
      const bodyData: { access_token: string; roles?: string[] } = {
        access_token: userAccessToken
      }
      
      if (hasVipRole) {
        bodyData.roles = [vipRoleId]
      }

      const vipJoinResponse = await fetch(`https://discord.com/api/guilds/${vipGuildId}/members/${discordUserId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${botToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyData)
      })

      if (!vipJoinResponse.ok) {
        const vipJoinError = await vipJoinResponse.text()
        console.error('Discord Auth Callback: Gagal menambahkan pengguna ke Server VIP.', vipJoinError)
        return NextResponse.redirect(new URL('/dashboard?discord=error&message=guild_join_failed', baseUrl))
      }

      // Jika user sudah berada di server VIP (HTTP 204), tambahkan role VIP secara manual jika dikonfigurasi
      if (vipJoinResponse.status === 204 && hasVipRole) {
        console.log(`Discord Auth Callback: Pengguna ${discordUsername} sudah di server VIP. Menambahkan role VIP...`)
        const roleResponse = await fetch(`https://discord.com/api/guilds/${vipGuildId}/members/${discordUserId}/roles/${vipRoleId}`, {
          method: 'PUT',
          headers: {
            Authorization: `Bot ${botToken}`
          }
        })

        if (!roleResponse.ok) {
          const roleError = await roleResponse.text()
          console.error('Discord Auth Callback: Gagal menambahkan role VIP.', roleError)
          return NextResponse.redirect(new URL('/dashboard?discord=error&message=role_assignment_failed', baseUrl))
        }
      }
    }

    // 7. Perbarui ID Discord di database (gunakan upsert agar mendukung pendaftaran free member)
    await prisma.$transaction([
      prisma.data_member_vip.upsert({
        where: { id_user_auth: user.id },
        update: { id_discord_user: discordUserId },
        create: {
          id_user_auth: user.id,
          email_member: user.email || '',
          status_aktif: 'free',
          id_discord_user: discordUserId
        }
      }),
      prisma.profiles.update({
        where: { id: user.id },
        data: { discord_joined: true }
      }),
      prisma.notifications.create({
        data: {
          user_id: user.id,
          title: isVip ? 'Discord VIP Aktif!' : 'Discord Terhubung!',
          message: isVip
            ? `Akun Discord kamu (${discordUsername}) telah terhubung dan otomatis bergabung ke Server VIP.`
            : `Akun Discord kamu (${discordUsername}) telah terhubung. Silakan bergabung ke Server Publik menggunakan link invite yang tersedia.`,
          type: 'success'
        }
      })
    ])

    console.log(`Discord Auth Callback Success: User ${user.email} sukses terhubung ke Discord ID: ${discordUserId}`)
    return NextResponse.redirect(new URL('/dashboard?discord=success', baseUrl))

  } catch (err: unknown) {
    const error = err as Error
    console.error('Discord Auth Callback Internal Error:', error)
    return NextResponse.redirect(new URL('/dashboard?discord=error&message=internal_error', baseUrl))
  }
}
