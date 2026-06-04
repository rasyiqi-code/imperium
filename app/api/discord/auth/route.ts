import { NextResponse } from 'next/server'
import { getAdminSettings } from '@/lib/adminSettings'

/**
 * Route API untuk menginisialisasi alur otorisasi OAuth2 Discord.
 * Mengalihkan pengguna ke Discord Developer Portal dengan scope yang diperlukan.
 */
export async function GET() {
  // Ambil data konfigurasi dari cache (menghindari query berulang)
  const settings = await getAdminSettings()

  const clientId = settings?.discord_application_id || process.env.DISCORD_APPLICATION_ID || process.env.DISCORD_CLIENT_ID
  const redirectUri = settings?.discord_redirect_uri || process.env.DISCORD_REDIRECT_URI

  if (!clientId || !redirectUri) {
    console.error('Discord Auth Error: Application ID or Redirect URI is missing.')
    return NextResponse.json(
      { error: 'Konfigurasi Discord API tidak lengkap di server.' },
      { status: 500 }
    )
  }

  // Menyusun URL otorisasi resmi Discord
  // Scope 'identify' untuk mengambil detail profil/ID user Discord
  // Scope 'guilds.join' untuk secara otomatis memasukkan user ke server
  const oauthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=identify%20guilds.join`

  return NextResponse.redirect(oauthUrl)
}
