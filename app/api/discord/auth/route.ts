import { NextResponse } from 'next/server'
import { getAdminSettings } from '@/lib/adminSettings'
import { cookies } from 'next/headers'

/**
 * Route API untuk menginisialisasi alur otorisasi OAuth2 Discord.
 * Mengalihkan pengguna ke Discord Developer Portal dengan scope yang diperlukan.
 */
export async function GET(request: Request) {
  // Ambil data konfigurasi dari cache (menghindari query berulang)
  const settings = await getAdminSettings()

  const clientId = settings?.discord_application_id || process.env.DISCORD_APPLICATION_ID || process.env.DISCORD_CLIENT_ID
  
  // Deteksi origin secara dinamis (mendukung localhost, IP lokal HP, dan domain produksi)
  const host = request.headers.get('x-forwarded-host') || new URL(request.url).host
  const proto = request.headers.get('x-forwarded-proto') || new URL(request.url).protocol.replace(':', '')
  const currentOrigin = `${proto}://${host}`
  
  // Gunakan redirect URI dari konfigurasi database admin jika di-set.
  // Jika tidak ada, gunakan fallback deteksi dinamis agar mempermudah local development.
  const redirectUri = settings?.discord_redirect_uri || `${currentOrigin}/api/discord/callback`

  if (!clientId || !redirectUri) {
    console.error('Discord Auth Error: Application ID or Redirect URI is missing.')
    return NextResponse.json(
      { error: 'Konfigurasi Discord API tidak lengkap di server.' },
      { status: 500 }
    )
  }

  // Generate token acak kriptografis untuk mencegah serangan CSRF (Cross-Site Request Forgery)
  const state = crypto.randomUUID()

  // Simpan state di cookie dengan durasi kedaluwarsa pendek (5 menit)
  const cookieStore = await cookies()
  cookieStore.set('discord_oauth_state', state, {
    path: '/',
    maxAge: 300, // 5 menit
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })

  // Menyusun URL otorisasi resmi Discord dengan menyertakan parameter state
  // Scope 'identify' untuk mengambil detail profil/ID user Discord
  // Scope 'guilds.join' untuk secara otomatis memasukkan user ke server
  const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=identify%20guilds.join&state=${state}`

  return NextResponse.redirect(oauthUrl)
}

