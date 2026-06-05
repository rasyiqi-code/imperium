'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { TrendingUp, TrendingDown, RefreshCw, Lock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

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

// --- Skeleton per baris ---
function CoinRowSkeleton() {
  return (
    <div className="flex items-center justify-between px-4 py-4 bg-neutral-950/60 border border-neutral-800/60 rounded-xl animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-neutral-800" />
        <div className="w-24 h-3 bg-neutral-800 rounded" />
      </div>
      <div className="flex items-center gap-3">
        <div className="w-20 h-3 bg-neutral-800 rounded" />
        <div className="w-12 h-4 bg-neutral-800/60 rounded" />
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
    const load = () => { void fetchMarketData() }
    load()
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

      {/* Daftar Coin — dibatasi tinggi dengan overflow-hidden agar overlay bisa bekerja */}
      <div className="relative">
        <div className="p-4 space-y-2">
          {loading
            ? Array.from({ length: 5 }).map((_, i) => <CoinRowSkeleton key={i} />)
            : coins.map((coin) => {
                const isUp = (coin.change24h ?? 0) >= 0
                const changeColor = isUp ? 'text-green-400' : 'text-red-400'
                const changeBg   = isUp ? 'bg-green-500/10 border-green-500/20' : 'bg-red-500/10 border-red-500/20'
                // Tampilkan volume hanya jika tersedia dan bukan "—"
                const hasVol = coin.volume24h && coin.volume24h !== '—'

                return (
                  <div
                    key={coin.symbol}
                    className="flex items-center justify-between px-4 py-3.5 bg-neutral-950/60 border border-neutral-800/60 rounded-xl hover:border-neutral-700 transition-all"
                  >
                    {/* Kiri: Ikon + Nama Pair */}
                    <div className="flex items-center gap-3">
                      {/* Logo coin dari CoinMarketCap CDN */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://s2.coinmarketcap.com/static/img/coins/64x64/${getCmcId(coin.cmcSlug)}.png`}
                        alt={coin.symbol}
                        width={28}
                        height={28}
                        className="rounded-full shrink-0"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement
                          target.style.display = 'none'
                          const fallback = target.nextElementSibling as HTMLElement | null
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      {/* Fallback ikon teks jika logo gagal dimuat */}
                      <span className="w-7 h-7 rounded-full bg-yellow-500/10 border border-yellow-500/20 items-center justify-center text-xs font-black text-yellow-500/70 hidden shrink-0">
                        {coin.icon}
                      </span>

                      <div>
                        <p className="text-xs font-extrabold text-neutral-200 tracking-widest uppercase">{coin.pair}</p>
                        {/* Tampilkan vol hanya jika ada datanya */}
                        {hasVol && (
                          <p className="text-[9px] text-neutral-600 font-bold mt-0.5">
                            Vol 24h: <span className="text-neutral-500">{coin.volume24h}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Kanan: Harga + Badge % Perubahan + Kunci non-VIP */}
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-black text-white font-mono tracking-tight">
                          {coin.price ?? '—'}
                        </p>
                        {coin.change24h !== null ? (
                          <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold mt-0.5 px-1.5 py-0.5 rounded border ${changeBg} ${changeColor}`}>
                            {isUp ? <TrendingUp size={8} /> : <TrendingDown size={8} />}
                            {isUp ? '+' : ''}{coin.change24h.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-[9px] text-neutral-700 font-bold">—</span>
                        )}
                      </div>

                      {/* Kunci kecil untuk non-VIP — VIP tidak ditampilkan apa-apa di sini */}
                      {!isVip && (
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
                )
              })}
        </div>

        {/* Overlay gradient fade ke bawah — tampil untuk non-VIP sebagai teaser */}
        {!loading && (
          <div className="absolute bottom-0 left-0 right-0 h-36 pointer-events-none"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(10,10,10,0.7) 45%, rgba(10,10,10,0.97) 100%)'
            }}
          />
        )}

        {/* Tombol CTA upgrade — tampil di atas overlay untuk semua member */}
        {!loading && (
          <div className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-1.5 pointer-events-none">
            <p className="text-[9px] font-bold text-neutral-400 tracking-wide">
              Sinyal lengkap tersedia untuk member <span className="text-yellow-500">VIP</span>
            </p>
            <Link
              href="/dashboard/upgrade"
              className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-[10px] font-black uppercase tracking-wider shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40 hover:scale-105 transition-all duration-200 active:scale-95"
            >
              Upgrade ke VIP <ArrowRight size={12} />
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * Mapping slug CMC ke ID numerik untuk mendapatkan logo coin.
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
