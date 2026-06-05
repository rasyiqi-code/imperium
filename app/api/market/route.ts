import { NextResponse } from 'next/server'
import { getAdminSettings } from '@/lib/adminSettings'

/**
 * API route untuk mengambil data harga kripto live.
 * Strategi bergantian (waterfall):
 *   1. FreeCryptoAPI + key (jika dikonfigurasi admin)
 *   2. CoinMarketCap   + key (jika dikonfigurasi admin)
 *   3. CoinGecko publik     (selalu tersedia, tanpa key, gratis)
 */
export const dynamic = 'force-dynamic'

// Pasangan coin yang ditampilkan sebagai teaser di dashboard
const COINS = [
  { symbol: 'BTC', pair: 'BTC / USDT', icon: '₿', cmcSlug: 'bitcoin',      geckoId: 'bitcoin',      cmcId: 1 },
  { symbol: 'ETH', pair: 'ETH / USDT', icon: 'Ξ', cmcSlug: 'ethereum',     geckoId: 'ethereum',     cmcId: 1027 },
  { symbol: 'SOL', pair: 'SOL / USDT', icon: '◎', cmcSlug: 'solana',        geckoId: 'solana',       cmcId: 5426 },
  { symbol: 'BNB', pair: 'BNB / USDT', icon: 'B', cmcSlug: 'bnb',           geckoId: 'binancecoin',  cmcId: 1839 },
  { symbol: 'XRP', pair: 'XRP / USDT', icon: '✕', cmcSlug: 'xrp',           geckoId: 'ripple',       cmcId: 52 },
]

// ─── Helper format angka ──────────────────────────────────────────────────────

function formatPrice(value: number): string {
  if (!value || isNaN(value)) return '—'
  if (value >= 1000) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (value >= 1)    return `$${value.toFixed(4)}`
  return `$${value.toFixed(6)}`
}

function formatLarge(value: number): string {
  if (!value || isNaN(value)) return '—'
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9)  return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6)  return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(2)}`
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
  source: string
  updatedAt: string
}

// ─── Sumber 1: FreeCryptoAPI (memerlukan API key) ─────────────────────────────
async function fetchFromFreeCryptoApi(apiKey: string): Promise<CoinData[]> {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }

  // Ambil semua coin secara paralel
  const results = await Promise.all(
    COINS.map(async (coin) => {
      const res = await fetch(
        `https://api.freecryptoapi.com/v1/getData?symbol=${coin.symbol}`,
        { headers, next: { revalidate: 60 } }
      )
      if (!res.ok) throw new Error(`FCA HTTP ${res.status} untuk ${coin.symbol}`)
      const json = await res.json()
      if (json.status === false) throw new Error(`FCA error: ${json.error}`)

      // FreeCryptoAPI: json.data[SYMBOL] atau json.data langsung
      const data = json?.data?.[coin.symbol] ?? json?.data ?? json
      return {
        symbol: coin.symbol,
        pair: coin.pair,
        icon: coin.icon,
        cmcSlug: coin.cmcSlug,
        cmcId: coin.cmcId,
        price: formatPrice(data.price ?? 0),
        priceRaw: Number(data.price ?? 0),
        change24h: Number(data.change_24h ?? data.percent_change_24h ?? 0),
        marketCap: formatLarge(data.market_cap ?? data.marketCap ?? 0),
        volume24h: formatLarge(data.volume ?? data.volume_24h ?? 0),
        source: 'freecryptoapi',
        updatedAt: new Date().toISOString(),
      }
    })
  )
  return results
}

// ─── Sumber 2: CoinMarketCap API (memerlukan API key) ─────────────────────────
async function fetchFromCoinMarketCap(apiKey: string): Promise<CoinData[]> {
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
  if (!res.ok) throw new Error(`CMC HTTP ${res.status}`)
  const json = await res.json()
  if (json.status?.error_code && json.status.error_code !== 0) {
    throw new Error(`CMC API error: ${json.status.error_message}`)
  }

  return COINS.map((coin) => {
    const data  = json?.data?.[coin.symbol]
    const quote = data?.quote?.USD
    return {
      symbol: coin.symbol,
      pair: coin.pair,
      icon: coin.icon,
      cmcSlug: coin.cmcSlug,
      cmcId: coin.cmcId,
      price: formatPrice(quote?.price ?? 0),
      priceRaw: Number(quote?.price ?? 0),
      change24h: Number(quote?.percent_change_24h ?? 0),
      marketCap: formatLarge(quote?.market_cap ?? 0),
      volume24h: formatLarge(quote?.volume_24h ?? 0),
      source: 'coinmarketcap',
      updatedAt: new Date().toISOString(),
    }
  })
}

// ─── Sumber 3: CoinGecko (publik, gratis, tanpa API key) ──────────────────────
async function fetchFromCoinGecko(): Promise<CoinData[]> {
  const geckoIds = COINS.map((c) => c.geckoId).join(',')
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
    {
      headers: { 'Accept': 'application/json' },
      next: { revalidate: 60 },
    }
  )
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`)
  const json = await res.json()

  return COINS.map((coin) => {
    const data = json?.[coin.geckoId]
    return {
      symbol: coin.symbol,
      pair: coin.pair,
      icon: coin.icon,
      cmcSlug: coin.cmcSlug,
      cmcId: coin.cmcId,
      price: formatPrice(data?.usd ?? 0),
      priceRaw: Number(data?.usd ?? 0),
      change24h: Number(data?.usd_24h_change ?? 0),
      marketCap: formatLarge(data?.usd_market_cap ?? 0),
      volume24h: formatLarge(data?.usd_24h_vol ?? 0),
      source: 'coingecko',
      updatedAt: new Date().toISOString(),
    }
  })
}

// ─── Handler Utama ────────────────────────────────────────────────────────────
export async function GET() {
  try {
    // Ambil API key dari database admin_settings
    const settings   = await getAdminSettings()
    const fcaApiKey  = settings?.freecryptoapi_key    ?? ''
    const cmcApiKey  = settings?.coinmarketcap_api_key ?? ''

    // Susun waterfall: sumber terbaik tersedia → fallback ke CoinGecko publik
    const attempts: Array<{ name: string; fn: () => Promise<CoinData[]> }> = []

    if (fcaApiKey)  attempts.push({ name: 'freecryptoapi', fn: () => fetchFromFreeCryptoApi(fcaApiKey) })
    if (cmcApiKey)  attempts.push({ name: 'coinmarketcap', fn: () => fetchFromCoinMarketCap(cmcApiKey) })
    // CoinGecko selalu jadi fallback terakhir — gratis, tanpa key
    attempts.push({ name: 'coingecko', fn: fetchFromCoinGecko })

    let coins: CoinData[] | null = null
    let usedSource = 'coingecko'
    const errors: string[] = []

    for (const { name, fn } of attempts) {
      try {
        const result = await fn()
        // Validasi: setidaknya satu coin harus punya harga valid
        if (!result.some((c) => c.priceRaw > 0)) {
          throw new Error(`Tidak ada harga valid dari ${name}`)
        }
        coins = result
        usedSource = name
        break
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        errors.push(`[${name}] ${msg}`)
        console.warn(`[market API] ${name} gagal:`, msg)
      }
    }

    if (!coins || coins.length === 0) {
      return NextResponse.json(
        { success: false, error: `Semua sumber data gagal: ${errors.join(' | ')}` },
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
