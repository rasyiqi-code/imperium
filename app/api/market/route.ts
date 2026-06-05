import { NextResponse } from 'next/server'

/**
 * API route untuk mengambil data harga kripto live.
 * Menggunakan FreeCryptoAPI (tanpa API key) sebagai sumber utama.
 * Mengembalikan data teaser: harga, perubahan 24h, dan market cap.
 */
export const dynamic = 'force-dynamic'

// Pasangan coin yang ditampilkan sebagai teaser di dashboard
const COINS = [
  { symbol: 'BTC', pair: 'BTC / USDT', icon: '₿', cmcSlug: 'bitcoin' },
  { symbol: 'ETH', pair: 'ETH / USDT', icon: 'Ξ', cmcSlug: 'ethereum' },
  { symbol: 'SOL', pair: 'SOL / USDT', icon: '◎', cmcSlug: 'solana' },
  { symbol: 'BNB', pair: 'BNB / USDT', icon: 'B', cmcSlug: 'bnb' },
  { symbol: 'XRP', pair: 'XRP / USDT', icon: '✕', cmcSlug: 'xrp' },
]

// Format angka menjadi singkatan (contoh: 1.2T, 345.6B)
function formatMarketCap(value: number): string {
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
  return `$${value.toFixed(2)}`
}

// Format harga dengan pemisah ribuan
function formatPrice(value: number): string {
  if (value >= 1000) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  if (value >= 1) return `$${value.toFixed(4)}`
  return `$${value.toFixed(6)}`
}

export async function GET() {
  try {
    // Ambil semua data coin secara paralel dari FreeCryptoAPI
    const results = await Promise.allSettled(
      COINS.map(async (coin) => {
        const res = await fetch(
          `https://api.freecryptoapi.com/v1/getData?symbol=${coin.symbol}`,
          {
            headers: { 'Accept': 'application/json' },
            next: { revalidate: 60 }, // cache 60 detik
          }
        )

        if (!res.ok) throw new Error(`FreeCryptoAPI error untuk ${coin.symbol}: ${res.status}`)

        const json = await res.json()
        // Struktur respons: json.data[symbol]
        const data = json?.data?.[coin.symbol] ?? json?.data ?? json

        return {
          symbol: coin.symbol,
          pair: coin.pair,
          icon: coin.icon,
          cmcSlug: coin.cmcSlug,
          price: formatPrice(data.price ?? 0),
          priceRaw: data.price ?? 0,
          change24h: data.change_24h ?? data.percent_change_24h ?? 0,
          marketCap: formatMarketCap(data.market_cap ?? data.marketCap ?? 0),
          volume24h: formatMarketCap(data.volume ?? data.volume_24h ?? 0),
          updatedAt: new Date().toISOString(),
        }
      })
    )

    // Gabungkan hasil — gunakan data fallback jika fetch gagal
    const coins = results.map((result, i) => {
      if (result.status === 'fulfilled') return result.value

      // Fallback jika API gagal
      return {
        symbol: COINS[i].symbol,
        pair: COINS[i].pair,
        icon: COINS[i].icon,
        cmcSlug: COINS[i].cmcSlug,
        price: null,
        priceRaw: null,
        change24h: null,
        marketCap: null,
        volume24h: null,
        error: true,
        updatedAt: new Date().toISOString(),
      }
    })

    return NextResponse.json({ success: true, coins })
  } catch (error) {
    console.error('Market API error:', error)
    return NextResponse.json(
      { success: false, error: 'Gagal mengambil data pasar' },
      { status: 500 }
    )
  }
}
