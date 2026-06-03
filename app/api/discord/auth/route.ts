import { NextResponse } from 'next/server'

/**
 * Route API untuk menginisialisasi alur otorisasi OAuth2 Discord.
 * Mengalihkan pengguna ke Discord Developer Portal dengan scope yang diperlukan.
 */
export async function GET() {
  const clientId = process.env.DISCORD_APPLICATION_ID || process.env.DISCORD_CLIENT_ID
  const redirectUri = process.env.DISCORD_REDIRECT_URI

  if (!clientId || !redirectUri) {
    console.error('Discord Auth Error: DISCORD_CLIENT_ID or DISCORD_REDIRECT_URI is missing.')
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
