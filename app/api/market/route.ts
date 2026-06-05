import { NextResponse } from 'next/server'
import { getAdminSettings } from '@/lib/adminSettings'

/**
 * API route untuk mengambil data harga kripto live.
 * Strategi pengambilan data: bergantian antara FreeCryptoAPI dan CoinMarketCap.
 * - Jika FreeCryptoAPI berhasil → gunakan hasilnya
 * - Jika gagal → fallback ke CoinMarketCap
 * - Jika keduanya gagal → kembalikan data kosong dengan flag error
 */
export const dynamic = 'force-dynamic'

// Pasangan coin yang ditampilkan sebagai teaser di dashboard
const COINS = [
  { symbol: 'BTC', pair: 'BTC / USDT', icon: '₿', cmcSlug: 'bitcoin',  cmcId: 1 },
  { symbol: 'ETH', pair: 'ETH / USDT', icon: 'Ξ', cmcSlug: 'ethereum', cmcId: 1027 },
  { symbol: 'SOL', pair: 'SOL / USDT', icon: '◎', cmcSlug: 'solana',   cmcId: 5426 },
  { symbol: 'BNB', pair: 'BNB / USDT', icon: 'B', cmcSlug: 'bnb',      cmcId: 1839 },
  { symbol: 'XRP', pair: 'XRP / USDT', icon: '✕', cmcSlug: 'xrp',      cmcId: 52 },
]

// Format harga dengan pemisah ribuan
function formatPrice(value: number): string {
  if (value >= 1000) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (value >= 1) return `$${value.toFixed(4)}`
  return `$${value.toFixed(6)}`
}

// Format angka besar menjadi singkatan (1.2T, 345.6B, dst)
function formatLarge(value: number): string {
  if (!value || isNaN(value)) return '—'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(2)}`
}

// ─── Sumber 1: FreeCryptoAPI ──────────────────────────────────────────────────
async function fetchFromFreeCryptoApi(apiKey: string) {
  const headers: HeadersInit = { 'Accept': 'application/json' }
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`

  // Ambil semua coin secara paralel
  const results = await Promise.all(
    COINS.map(async (coin) => {
      const res = await fetch(
        `https://api.freecryptoapi.com/v1/getData?symbol=${coin.symbol}`,
        { headers, next: { revalidate: 60 } }
      )
      if (!res.ok) throw new Error(`FCA ${coin.symbol}: ${res.status}`)
      const json = await res.json()
      // FreeCryptoAPI mengembalikan data di json.data[SYMBOL] atau langsung json.data
      const data = json?.data?.[coin.symbol] ?? json?.data ?? json
      return {
        symbol: coin.symbol,
        pair: coin.pair,
        icon: coin.icon,
        cmcSlug: coin.cmcSlug,
        cmcId: coin.cmcId,
        price: formatPrice(data.price ?? 0),
        priceRaw: data.price ?? 0,
        change24h: data.change_24h ?? data.percent_change_24h ?? 0,
        marketCap: formatLarge(data.market_cap ?? data.marketCap ?? 0),
        volume24h: formatLarge(data.volume ?? data.volume_24h ?? 0),
        source: 'freecryptoapi' as const,
        updatedAt: new Date().toISOString(),
      }
    })
  )
  return results
}

// ─── Sumber 2: CoinMarketCap API ─────────────────────────────────────────────
async function fetchFromCoinMarketCap(apiKey: string) {
  const symbols = COINS.map((c) => c.symbol).join(',')
  const res = await fetch(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`,
    {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json',
      },
      next: { revalidate: 60 },
    }
  )
  if (!res.ok) throw new Error(`CMC: ${res.status}`)
  const json = await res.json()

  return COINS.map((coin) => {
    const data = json?.data?.[coin.symbol]
    const quote = data?.quote?.USD
    return {
      symbol: coin.symbol,
      pair: coin.pair,
      icon: coin.icon,
      cmcSlug: coin.cmcSlug,
      cmcId: coin.cmcId,
      price: formatPrice(quote?.price ?? 0),
      priceRaw: quote?.price ?? 0,
      change24h: quote?.percent_change_24h ?? 0,
      marketCap: formatLarge(quote?.market_cap ?? 0),
      volume24h: formatLarge(quote?.volume_24h ?? 0),
      source: 'coinmarketcap' as const,
      updatedAt: new Date().toISOString(),
    }
  })
}

// ─── Tipe data coin bersama ───────────────────────────────────────────────────
interface CoinData {
  symbol: string
  pair: string
  icon: string
  cmcSlug: string
  cmcId: number
  price: string
  priceRaw: number
  change24h: number
  marketCap: string
  volume24h: string
  source: 'freecryptoapi' | 'coinmarketcap' | 'public'
  updatedAt: string
}

// ─── Handler Utama ────────────────────────────────────────────────────────────
export async function GET() {
  try {
    // Ambil API key dari database admin_settings
    const settings = await getAdminSettings()
    const fcaApiKey  = settings?.freecryptoapi_key    ?? ''
    const cmcApiKey  = settings?.coinmarketcap_api_key ?? ''

    // Tentukan urutan: coba FCA dulu, fallback ke CMC, lalu public FCA
    // Strategi: bergantian — FCA → CMC → FCA public (tanpa key)
    const attempts: Array<() => Promise<CoinData[]>> = []

    if (fcaApiKey)  attempts.push(() => fetchFromFreeCryptoApi(fcaApiKey))
    if (cmcApiKey)  attempts.push(() => fetchFromCoinMarketCap(cmcApiKey))
    // Selalu sertakan akses publik FCA sebagai fallback terakhir
    attempts.push(() => fetchFromFreeCryptoApi(''))

    let coins: CoinData[] | null = null
    let lastError: string = ''
    let usedSource = 'public'

    for (const attempt of attempts) {
      try {
        const result = await attempt()
        // Verifikasi: setidaknya satu coin memiliki harga valid
        const valid = result.some((c) => c.priceRaw > 0)
        if (!valid) throw new Error('Tidak ada data harga valid dari sumber ini')
        coins = result
        usedSource = result[0]?.source ?? 'unknown'
        break // Berhasil — hentikan loop
      } catch (err) {
        lastError = err instanceof Error ? err.message : String(err)
        console.warn(`[market API] Sumber gagal: ${lastError}`)
        // Lanjut ke sumber berikutnya
      }
    }

    if (!coins || coins.length === 0) {
      return NextResponse.json(
        { success: false, error: `Semua sumber data gagal. Error terakhir: ${lastError}` },
        { status: 503 }
      )
    }

    return NextResponse.json({ success: true, coins, source: usedSource })
  } catch (error) {
    console.error('[market API] Error tidak terduga:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pasar' },
      { status: 500 }
    )
  }
}
