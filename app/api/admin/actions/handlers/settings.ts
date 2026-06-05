import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { paymentManager } from '@crediblemark/buayar'
import { getAdminSettings as getCachedSettings, invalidateAdminSettingsCache } from '@/lib/adminSettings'

interface SettingsBody {
  dbField?: string
  value?: boolean
  apiKey?: string
  senderEmail?: string
  clientKey?: string
  serverKey?: string
  publicKey?: string
  isProduction?: boolean
  upgradeMode?: string
  enabledPayments?: string[]
  applicationId?: string
  clientSecret?: string
  botToken?: string
  vipServerId?: string
  vipRoleId?: string
  freeInviteLink?: string
  redirectUri?: string
  // API key untuk integrasi data pasar
  freecryptoapiKey?: string
  coinmarketcapApiKey?: string
}

/**
 * Toggle boolean status untuk setelan sistem (email_notif_active, maintenance_mode, dsb).
 */
export async function toggleSetting(body: SettingsBody): Promise<Response> {
  const { dbField, value } = body
  if (!dbField) return NextResponse.json({ error: 'Missing dbField' }, { status: 400 })

  // Toggle toggle setting lewat Prisma
  await prisma.admin_settings.update({
    where: { id: 1 },
    data: { [dbField]: value }
  })

  // Invalidasi cache agar perubahan langsung terasa di seluruh sistem
  invalidateAdminSettingsCache()

  return NextResponse.json({ success: true })
}

/**
 * Memperbarui pengaturan Resend API.
 */
export async function updateResendSettings(body: SettingsBody): Promise<Response> {
  const { apiKey, senderEmail } = body
  
  // Simpan setelan Resend lewat Prisma
  await prisma.admin_settings.update({
    where: { id: 1 },
    data: {
      resend_api_key: apiKey || null,
      resend_sender_email: senderEmail || null
    }
  })

  // Invalidasi cache agar perubahan langsung terasa
  invalidateAdminSettingsCache()

  return NextResponse.json({ success: true })
}

/**
 * Memperbarui pengaturan kredensial Midtrans.
 */
export async function updateMidtransSettings(body: SettingsBody): Promise<Response> {
  const { clientKey, serverKey, publicKey, isProduction, upgradeMode } = body
  
  // Simpan setelan Midtrans lewat Prisma
  await prisma.admin_settings.update({
    where: { id: 1 },
    data: {
      midtrans_client_key: clientKey || null,
      midtrans_server_key: serverKey || null,
      midtrans_public_key: publicKey || null,
      midtrans_is_production: Boolean(isProduction),
      midtrans_upgrade_mode: upgradeMode || 'stacking'
    }
  })

  // Invalidasi cache agar perubahan langsung terasa
  invalidateAdminSettingsCache()

  return NextResponse.json({ success: true })
}

/**
 * Menyinkronkan daftar metode pembayaran dari Midtrans Dashboard.
 */
export async function syncMidtransPaymentMethods(): Promise<Response> {
  // Ambil data server key Midtrans melalui cache
  const mtSettings = await getCachedSettings()

  const sKey = mtSettings?.midtrans_server_key || ''
  const cKey = mtSettings?.midtrans_client_key || ''
  if (!sKey) {
    return NextResponse.json({ error: 'Server key Midtrans belum dikonfigurasi' }, { status: 400 })
  }

  const isProd = mtSettings?.midtrans_is_production === true

  const probeResult = await paymentManager.probePaymentMethods('midtrans', {
    merchantCode: cKey,
    apiKey: sKey,
    sandbox: !isProd,
  })

  if (!probeResult.success) {
    return NextResponse.json({ error: probeResult.error || 'Gagal melakukan probe metode pembayaran' }, { status: 500 })
  }

  const enabled = probeResult.enabled

  // Simpan daftar payment methods yang aktif ke database melalui Prisma
  await prisma.admin_settings.update({
    where: { id: 1 },
    data: { midtrans_enabled_payments: enabled as Prisma.InputJsonValue }
  })

  // Invalidasi cache agar perubahan langsung terasa
  invalidateAdminSettingsCache()

  return NextResponse.json({ success: true, enabled })
}

/**
 * Memperbarui daftar metode pembayaran yang diizinkan untuk digunakan di website.
 */
export async function updateEnabledPayments(body: SettingsBody): Promise<Response> {
  const { enabledPayments } = body
  if (!Array.isArray(enabledPayments)) {
    return NextResponse.json({ error: 'enabledPayments harus berupa array' }, { status: 400 })
  }

  // Perbarui enabled payments lewat Prisma
  await prisma.admin_settings.update({
    where: { id: 1 },
    data: { midtrans_enabled_payments: enabledPayments as Prisma.InputJsonValue }
  })

  // Invalidasi cache agar perubahan langsung terasa
  invalidateAdminSettingsCache()

  return NextResponse.json({ success: true })
}

/**
 * Mengambil seluruh setelan admin sistem.
 */
export async function getAdminSettingsHandler(adminUserId: string): Promise<Response> {
  // Ambil pengaturan admin sistem via cache (force refresh agar admin selalu melihat data terbaru)
  const [settings, sessionResult] = await Promise.all([
    getCachedSettings(true),
    prisma.$queryRawUnsafe<{ count: number }[]>(
      `SELECT count(*)::int as count FROM auth.sessions WHERE user_id = $1::uuid`,
      adminUserId
    ).catch(() => [{ count: 1 }]) // Fallback jika query gagal
  ])
  
  const activeSessionsCount = sessionResult[0]?.count ?? 1

  return NextResponse.json({ success: true, settings, activeSessionsCount })
}

/**
 * Memperbarui pengaturan kredensial Discord.
 */
export async function updateDiscordSettings(body: SettingsBody): Promise<Response> {
  const { applicationId, clientSecret, botToken, vipServerId, vipRoleId, freeInviteLink, redirectUri } = body
  
  // Simpan setelan Discord lewat Prisma
  await prisma.admin_settings.update({
    where: { id: 1 },
    data: {
      discord_application_id: applicationId || null,
      discord_client_secret: clientSecret || null,
      discord_bot_token: botToken || null,
      discord_vip_server_id: vipServerId || null,
      discord_vip_role_id: vipRoleId || null,
      discord_free_invite_link: freeInviteLink || null,
      discord_redirect_uri: redirectUri || null
    }
  })

  // Invalidasi cache agar perubahan langsung terasa
  invalidateAdminSettingsCache()

  return NextResponse.json({ success: true })
}

/**
 * Memperbarui API key untuk integrasi data pasar (FreeCryptoAPI & CoinMarketCap).
 */
export async function updateMarketApiSettings(body: SettingsBody): Promise<Response> {
  const { freecryptoapiKey, coinmarketcapApiKey } = body

  // Simpan API key pasar ke database melalui Prisma
  await prisma.admin_settings.update({
    where: { id: 1 },
    data: {
      freecryptoapi_key: freecryptoapiKey !== undefined ? (freecryptoapiKey || null) : undefined,
      coinmarketcap_api_key: coinmarketcapApiKey !== undefined ? (coinmarketcapApiKey || null) : undefined,
    }
  })

  // Invalidasi cache agar perubahan langsung terasa di seluruh sistem
  invalidateAdminSettingsCache()

  return NextResponse.json({ success: true })
}
