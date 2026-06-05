'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, ExternalLink, RefreshCw, Lock } from 'lucide-react'

// --- Tipe Data ---
interface CoinData {
  symbol: string
  pair: string
  icon: string
  cmcSlug: string
  price: string | null
  priceRaw: number | null
  change24h: number | null
  marketCap: string | null
  volume24h: string | null
  error?: boolean
  updatedAt: string
}

interface TradingSignalsProps {
  isVip: boolean
  onUpgradeClick: () => void
}

// --- Komponen skeleton per baris ---
function CoinRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-4 bg-neutral-950/60 border border-neutral-800/60 rounded-xl animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-neutral-800" />
        <div className="space-y-1.5">
          <div className="w-20 h-3 bg-neutral-800 rounded" />
          <div className="w-14 h-2 bg-neutral-800/60 rounded" />
        </div>
      </div>
      <div className="text-right space-y-1.5">
        <div className="w-24 h-3 bg-neutral-800 rounded ml-auto" />
        <div className="w-16 h-2 bg-neutral-800/60 rounded ml-auto" />
      </div>
    </div>
  )
}

// --- Komponen utama ---
export default function TradingSignals({ isVip, onUpgradeClick }: TradingSignalsProps) {
  const [coins, setCoins] = useState<CoinData[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Ambil data dari API internal kita yang memanggil FreeCryptoAPI
  const fetchMarketData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true)
    try {
      const res = await fetch('/api/market', { cache: 'no-store' })
      const json = await res.json()
      if (json.success && Array.isArray(json.coins)) {
        setCoins(json.coins)
        setLastUpdated(new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      }
    } catch {
      // Abaikan error jaringan — data lama tetap ditampilkan
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    // Bungkus dengan void agar eslint tidak mendeteksi setState synchronous
    const load = () => { void fetchMarketData() }
    load()
    // Refresh otomatis setiap 60 detik
    const interval = setInterval(load, 60_000)
    return () => clearInterval(interval)
  }, [fetchMarketData])

  return (
    <div className="relative overflow-hidden bg-neutral-900/50 border border-neutral-800 rounded-2xl text-left">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800/70">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl text-green-400 border border-green-500/20 shrink-0">
            <TrendingUp size={16} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-white tracking-tight uppercase">Live Trading Signals</h3>
            <p className="text-[9px] text-neutral-500 font-bold mt-0.5">
              {lastUpdated ? `Diperbarui pukul ${lastUpdated}` : 'Memuat data pasar...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Tombol refresh manual */}
          <button
            onClick={() => fetchMarketData(true)}
            disabled={refreshing}
            className="p-1.5 text-neutral-600 hover:text-neutral-300 transition-colors disabled:opacity-40"
            title="Perbarui data"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} />
          </button>

          {/* Badge LIVE */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[9px] font-bold text-green-400 uppercase tracking-widest">Live</span>
          </div>
        </div>
      </div>

      {/* Daftar Coin */}
      <div className="p-4 space-y-2">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => <CoinRowSkeleton key={i} />)
          : coins.map((coin) => {
              const isUp = (coin.change24h ?? 0) >= 0
              const changeColor = isUp ? 'text-green-400' : 'text-red-400'
              const changeBg = isUp ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'

              return (
                <div
                  key={coin.symbol}
                  className="flex items-center justify-between px-4 py-3.5 bg-neutral-950/60 border border-neutral-800/60 rounded-xl hover:border-neutral-700 transition-all group"
                >
                  {/* Kiri: Ikon + Nama Pair */}
                  <div className="flex items-center gap-3">
                    {/* Ikon coin dari CoinMarketCap CDN */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${getCmcId(coin.cmcSlug)}.png`}
                      alt={coin.symbol}
                      width={28}
                      height={28}
                      className="rounded-full"
                      onError={(e) => {
                        // Fallback ke teks ikon jika gambar gagal
                        const target = e.currentTarget as HTMLImageElement
                        target.style.display = 'none'
                        const fallback = target.nextElementSibling as HTMLElement | null
                        if (fallback) fallback.style.display = 'flex'
                      }}
                    />
                    {/* Fallback ikon teks */}
                    <span
                      className="w-7 h-7 rounded-full bg-yellow-500/10 border border-yellow-500/20 items-center justify-center text-xs font-black text-yellow-500/70 hidden"
                    >
                      {coin.icon}
                    </span>

                    <div>
                      <p className="text-xs font-extrabold text-neutral-200 tracking-widest uppercase">{coin.pair}</p>
                      <p className="text-[9px] text-neutral-600 font-bold mt-0.5">
                        Vol 24h: <span className="text-neutral-500">{coin.volume24h ?? '—'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Kanan: Harga + Perubahan + Teaser VIP */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {/* Harga live */}
                      <p className="text-xs font-black text-white font-mono tracking-tight">
                        {coin.price ?? '—'}
                      </p>
                      {/* % Perubahan 24h */}
                      {coin.change24h !== null ? (
                        <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded border ${changeBg} ${changeColor}`}>
                          {isUp ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                          {isUp ? '+' : ''}{coin.change24h.toFixed(2)}%
                        </span>
                      ) : (
                        <span className="text-[9px] text-neutral-700 font-bold">—</span>
                      )}
                    </div>

                    {/* Teaser signal VIP tersembunyi */}
                    <div className="relative">
                      {isVip ? (
                        /* Anggota VIP: badge signal (placeholder — detail di Discord) */
                        <div className="text-[8px] font-black px-2 py-1 rounded border border-yellow-500/30 bg-yellow-500/5 text-yellow-500/70 uppercase tracking-wider whitespace-nowrap">
                          Lihat di Discord
                        </div>
                      ) : (
                        /* Non-VIP: ikon kunci mini */
                        <button
                          onClick={onUpgradeClick}
                          className="p-1.5 rounded-lg bg-neutral-800/60 border border-neutral-700 text-neutral-600 hover:text-yellow-500 hover:border-yellow-500/30 transition-all active:scale-90"
                          title="Buka akses VIP untuk sinyal lengkap"
                        >
                          <Lock size={10} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

        {/* Banner teaser — tampil untuk semua member (free & VIP) */}
        <div className="mt-3 px-4 py-3.5 bg-gradient-to-r from-yellow-500/5 via-amber-500/5 to-transparent border border-yellow-500/15 rounded-xl flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black text-yellow-400/80 uppercase tracking-wider">Sinyal Lengkap di Komunitas VIP</p>
            <p className="text-[9px] text-neutral-500 mt-0.5 leading-relaxed">
              Entry point, Stop Loss, Take Profit & analisis teknikal lengkap tersedia eksklusif di Discord VIP Imperium.
            </p>
          </div>
          <a
            href="https://discord.gg"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-yellow-500 hover:text-yellow-400 transition-colors"
          >
            Gabung <ExternalLink size={9} />
          </a>
        </div>
      </div>
    </div>
  )
}

/**
 * Mapping slug CMC ke ID numerik untuk mendapatkan logo.
 * ID ini stabil dan tidak berubah di CoinMarketCap.
 */
function getCmcId(slug: string): number {
  const map: Record<string, number> = {
    bitcoin: 1,
    ethereum: 1027,
    solana: 5426,
    bnb: 1839,
    xrp: 52,
    usdt: 825,
    usdc: 3408,
    cardano: 2010,
    dogecoin: 74,
    avalanche: 5805,
  }
  return map[slug] ?? 1
}
