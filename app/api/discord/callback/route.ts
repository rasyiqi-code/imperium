import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabaseServerClient'
import { prisma } from '@/lib/prisma'

/**
 * Route API Callback OAuth2 Discord.
 * Memproses kode otorisasi dari Discord, menukarnya dengan access token,
 * mendaftarkan user ke Server Discord, memberikan role VIP, dan memperbarui DB.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')

    // Jika pengguna menolak otorisasi atau terjadi error dari Discord
    if (errorParam || !code) {
      console.warn('Discord Auth Callback: Otorisasi ditolak oleh user atau code tidak ada.', errorParam)
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=auth_denied', request.url))
    }

    // 1. Validasi sesi pengguna Supabase secara server-side
    const clientSupabase = await createSupabaseServerClient()
    const { data: { user }, error: authError } = await clientSupabase.auth.getUser()

    if (authError || !user) {
      console.error('Discord Auth Callback: Sesi pengguna tidak valid.', authError)
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=unauthorized', request.url))
    }

    // 2. Periksa status keanggotaan VIP pengguna di database
    const memberVip = await prisma.data_member_vip.findUnique({
      where: { id_user_auth: user.id }
    })

    const isVip = memberVip?.status_aktif === 'aktif' || memberVip?.status_aktif === 'vip'

    if (!isVip) {
      console.warn(`Discord Auth Callback: Pengguna ${user.id} tidak memiliki status VIP aktif.`)
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=not_vip', request.url))
    }

    // 3. Ambil konfigurasi Discord dari environment variables
    const clientId = process.env.DISCORD_CLIENT_ID
    const clientSecret = process.env.DISCORD_CLIENT_SECRET
    const botToken = process.env.DISCORD_BOT_TOKEN
    const guildId = process.env.DISCORD_GUILD_ID
    const vipRoleId = process.env.DISCORD_VIP_ROLE_ID
    const redirectUri = process.env.DISCORD_REDIRECT_URI

    if (!clientId || !clientSecret || !botToken || !guildId || !vipRoleId || !redirectUri) {
      console.error('Discord Auth Callback: Konfigurasi Discord API tidak lengkap di .env.')
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=config_missing', request.url))
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
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=token_exchange_failed', request.url))
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
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=profile_fetch_failed', request.url))
    }

    const userProfile = await userProfileResponse.json()
    const discordUserId = userProfile.id
    const discordUsername = userProfile.username

    // 6. Masukkan pengguna ke server Discord VIP
    // Endpoint ini akan menambahkan user secara langsung jika belum bergabung
    const joinResponse = await fetch(`https://discord.com/api/guilds/${guildId}/members/${discordUserId}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bot ${botToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        access_token: userAccessToken,
        roles: [vipRoleId]
      })
    })

    if (!joinResponse.ok) {
      const joinError = await joinResponse.text()
      console.error('Discord Auth Callback: Gagal menambahkan pengguna ke server.', joinError)
      return NextResponse.redirect(new URL('/dashboard?discord=error&message=guild_join_failed', request.url))
    }

    // Jika user sudah ada di server (status 204), tambahkan role VIP secara eksplisit
    if (joinResponse.status === 204) {
      console.log(`Discord Auth Callback: Pengguna ${discordUsername} sudah di server. Menambahkan role VIP...`)
      const roleResponse = await fetch(`https://discord.com/api/guilds/${guildId}/members/${discordUserId}/roles/${vipRoleId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bot ${botToken}`
        }
      })

      if (!roleResponse.ok) {
        const roleError = await roleResponse.text()
        console.error('Discord Auth Callback: Gagal menambahkan role VIP.', roleError)
        return NextResponse.redirect(new URL('/dashboard?discord=error&message=role_assignment_failed', request.url))
      }
    }

    // 7. Simpan ID Discord ke database dan perbarui profil keanggotaan
    await prisma.$transaction([
      prisma.data_member_vip.update({
        where: { id_user_auth: user.id },
        data: { id_discord_user: discordUserId }
      }),
      prisma.profiles.update({
        where: { id: user.id },
        data: { discord_joined: true }
      }),
      prisma.notifications.create({
        data: {
          user_id: user.id,
          title: 'Discord VIP Aktif!',
          message: `Akun Discord kamu (${discordUsername}) telah terhubung dan otomatis masuk ke server VIP.`,
          type: 'success'
        }
      })
    ])

    console.log(`Discord Auth Callback Success: User ${user.email} sukses terhubung ke Discord ID: ${discordUserId}`)
    return NextResponse.redirect(new URL('/dashboard?discord=success', request.url))

  } catch (err: unknown) {
    const error = err as Error
    console.error('Discord Auth Callback Internal Error:', error)
    return NextResponse.redirect(new URL('/dashboard?discord=error&message=internal_error', request.url))
  }
}
