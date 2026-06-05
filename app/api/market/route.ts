import { NextResponse } from 'next/server'
import { getAdminSettings } from '@/lib/adminSettings'

/**
 * API route untuk mengambil data harga kripto live.
 *
 * Strategi pengambilan data:
 *  1. FCA dan CMC dipakai secara bergantian tiap hari
 *     (hari genap → FreeCryptoAPI, hari ganjil → CoinMarketCap)
 *  2. In-memory cache 5 menit — server hanya fetch ke API eksternal 1x
 *     per 5 menit meskipun banyak user mengakses /api/market secara bersamaan
 *  3. CoinGecko publik selalu jadi fallback terakhir jika kedua API gagal
 *     atau key belum dikonfigurasi
 */
export const dynamic = 'force-dynamic'

// ─── In-memory cache (hidup selama proses server berjalan) ───────────────────
interface MarketCache {
  data: CoinData[]
  source: string
  fetchedAt: number   // epoch ms
}

// Cache tunggal per proses — tidak di-reset saat hot reload dev
let _cache: MarketCache | null = null
const CACHE_TTL_MS = 5 * 60 * 1000   // 5 menit

// ─── Definisi coin ────────────────────────────────────────────────────────────
const COINS = [
  { symbol: 'BTC', pair: 'BTC / USDT', icon: '₿', cmcSlug: 'bitcoin',     geckoId: 'bitcoin',     cmcId: 1 },
  { symbol: 'ETH', pair: 'ETH / USDT', icon: 'Ξ', cmcSlug: 'ethereum',    geckoId: 'ethereum',    cmcId: 1027 },
  { symbol: 'SOL', pair: 'SOL / USDT', icon: '◎', cmcSlug: 'solana',      geckoId: 'solana',      cmcId: 5426 },
  { symbol: 'BNB', pair: 'BNB / USDT', icon: 'B', cmcSlug: 'bnb',         geckoId: 'binancecoin', cmcId: 1839 },
  { symbol: 'XRP', pair: 'XRP / USDT', icon: '✕', cmcSlug: 'xrp',         geckoId: 'ripple',      cmcId: 52 },
]

// ─── Tipe data coin ──────────────────────────────────────────────────────────
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

// ─── Helper format ────────────────────────────────────────────────────────────
function formatPrice(v: number): string {
  if (!v || isNaN(v)) return '—'
  if (v >= 1000) return `$${v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (v >= 1)    return `$${v.toFixed(4)}`
  return `$${v.toFixed(6)}`
}

function formatLarge(v: number): string {
  if (!v || isNaN(v)) return '—'
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`
  if (v >= 1e9)  return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6)  return `$${(v / 1e6).toFixed(2)}M`
  return `$${v.toFixed(2)}`
}

// ─── Sumber 1: FreeCryptoAPI ──────────────────────────────────────────────────
async function fetchFromFreeCryptoApi(apiKey: string): Promise<CoinData[]> {
  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  }
  const results = await Promise.all(
    COINS.map(async (coin) => {
      const res = await fetch(
        `https://api.freecryptoapi.com/v1/getData?symbol=${coin.symbol}`,
        { headers, cache: 'no-store' }
      )
      if (!res.ok) throw new Error(`FCA HTTP ${res.status} untuk ${coin.symbol}`)
      const json = await res.json()
      if (json.status !== 'success' || !Array.isArray(json.symbols) || json.symbols.length === 0) {
        throw new Error(`FCA gagal ${coin.symbol}: ${json.error ?? json.status}`)
      }
      const d = json.symbols[0]
      const price  = parseFloat(d.last ?? '0')
      const change = parseFloat(d.daily_change_percentage ?? '0')
      return {
        symbol: coin.symbol, pair: coin.pair, icon: coin.icon,
        cmcSlug: coin.cmcSlug, cmcId: coin.cmcId,
        price: formatPrice(price), priceRaw: price,
        change24h: change, marketCap: '—', volume24h: '—',
        source: 'freecryptoapi',
        updatedAt: new Date().toISOString(),
      }
    })
  )
  return results
}

// ─── Sumber 2: CoinMarketCap ──────────────────────────────────────────────────
async function fetchFromCoinMarketCap(apiKey: string): Promise<CoinData[]> {
  const symbols = COINS.map((c) => c.symbol).join(',')
  const res = await fetch(
    `https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?symbol=${symbols}&convert=USD`,
    { headers: { 'X-CMC_PRO_API_KEY': apiKey, 'Accept': 'application/json' }, cache: 'no-store' }
  )
  if (!res.ok) throw new Error(`CMC HTTP ${res.status}`)
  const json = await res.json()
  if (json.status?.error_code && json.status.error_code !== 0) {
    throw new Error(`CMC error: ${json.status.error_message}`)
  }
  return COINS.map((coin) => {
    const d = json?.data?.[coin.symbol]
    const q = d?.quote?.USD
    return {
      symbol: coin.symbol, pair: coin.pair, icon: coin.icon,
      cmcSlug: coin.cmcSlug, cmcId: coin.cmcId,
      price: formatPrice(q?.price ?? 0), priceRaw: Number(q?.price ?? 0),
      change24h: Number(q?.percent_change_24h ?? 0),
      marketCap: formatLarge(q?.market_cap ?? 0),
      volume24h: formatLarge(q?.volume_24h ?? 0),
      source: 'coinmarketcap',
      updatedAt: new Date().toISOString(),
    }
  })
}

// ─── Sumber 3: CoinGecko (publik, tanpa key) ──────────────────────────────────
async function fetchFromCoinGecko(): Promise<CoinData[]> {
  const geckoIds = COINS.map((c) => c.geckoId).join(',')
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${geckoIds}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true&include_24hr_vol=true`,
    { headers: { 'Accept': 'application/json' }, cache: 'no-store' }
  )
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`)
  const json = await res.json()
  return COINS.map((coin) => {
    const d = json?.[coin.geckoId]
    return {
      symbol: coin.symbol, pair: coin.pair, icon: coin.icon,
      cmcSlug: coin.cmcSlug, cmcId: coin.cmcId,
      price: formatPrice(d?.usd ?? 0), priceRaw: Number(d?.usd ?? 0),
      change24h: Number(d?.usd_24h_change ?? 0),
      marketCap: formatLarge(d?.usd_market_cap ?? 0),
      volume24h: formatLarge(d?.usd_24h_vol ?? 0),
      source: 'coingecko',
      updatedAt: new Date().toISOString(),
    }
  })
}

// ─── Rotasi harian: tentukan sumber utama & sekunder ─────────────────────────
/**
 * Menentukan urutan sumber berdasarkan hari dalam tahun.
 * Hari genap  → coba FCA dulu, lalu CMC
 * Hari ganjil → coba CMC dulu, lalu FCA
 * CoinGecko selalu jadi fallback terakhir.
 */
function buildAttempts(fcaKey: string, cmcKey: string) {
  const dayOfYear = Math.floor(Date.now() / 86_400_000) // hari sejak epoch
  const fcaFirst  = dayOfYear % 2 === 0

  type Attempt = { name: string; fn: () => Promise<CoinData[]> }
  const primary: Attempt[]   = []
  const secondary: Attempt[] = []

  if (fcaKey) primary.push(  { name: 'freecryptoapi', fn: () => fetchFromFreeCryptoApi(fcaKey) })
  if (cmcKey) secondary.push({ name: 'coinmarketcap',  fn: () => fetchFromCoinMarketCap(cmcKey) })

  // Susun urutan sesuai rotasi hari ini
  const ordered = fcaFirst
    ? [...primary, ...secondary]
    : [...secondary, ...primary]

  // CoinGecko selalu jadi fallback terakhir
  ordered.push({ name: 'coingecko', fn: fetchFromCoinGecko })

  return ordered
}

// ─── Handler Utama ────────────────────────────────────────────────────────────
export async function GET() {
  try {
    const now = Date.now()

    // Kembalikan cache jika masih valid (TTL 5 menit)
    if (_cache && now - _cache.fetchedAt < CACHE_TTL_MS) {
      return NextResponse.json({
        success: true,
        coins: _cache.data,
        source: _cache.source,
        cached: true,
        cachedAgo: Math.round((now - _cache.fetchedAt) / 1000),
      })
    }

    // Ambil API key dari database admin_settings
    const settings  = await getAdminSettings()
    const fcaApiKey = settings?.freecryptoapi_key    ?? ''
    const cmcApiKey = settings?.coinmarketcap_api_key ?? ''

    const attempts = buildAttempts(fcaApiKey, cmcApiKey)

    let coins: CoinData[] | null = null
    let usedSource = 'coingecko'
    const errors: string[] = []

    for (const { name, fn } of attempts) {
      try {
        const result = await fn()
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
        { success: false, error: `Semua sumber gagal: ${errors.join(' | ')}` },
        { status: 503 }
      )
    }

    // Simpan ke in-memory cache
    _cache = { data: coins, source: usedSource, fetchedAt: now }

    return NextResponse.json({ success: true, coins, source: usedSource, cached: false })
  } catch (error) {
    console.error('[market API] Error tidak terduga:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pasar' },
      { status: 500 }
    )
  }
}
