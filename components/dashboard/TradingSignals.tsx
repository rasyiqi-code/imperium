'use client'

import React from 'react'
import { Lock, TrendingUp, Zap } from 'lucide-react'

interface TradingSignalsProps {
  isVip: boolean
  onUpgradeClick: () => void
}

export default function TradingSignals({ isVip, onUpgradeClick }: TradingSignalsProps) {
  return (
    <div className="relative overflow-hidden bg-neutral-900/50 border border-neutral-800 rounded-2xl text-left">
      {/* Overlay kunci untuk non-VIP */}
      {!isVip && (
        <div className="absolute inset-0 z-10 backdrop-blur-md bg-black/70 flex flex-col items-center justify-center text-center p-6 rounded-2xl">
          <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl mb-4 shadow-2xl">
            <Lock className="text-yellow-500" size={28} />
          </div>
          <h3 className="text-base font-extrabold text-white mb-2 uppercase tracking-tight">Konten VIP Terkunci</h3>
          <p className="text-neutral-500 text-xs max-w-xs mb-5 leading-relaxed">
            Upgrade ke paket VIP Imperium untuk akses sinyal trading harian dengan akurasi tinggi.
          </p>
          <button 
            onClick={onUpgradeClick}
            className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-2.5 rounded-xl font-bold hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg active:scale-95 text-xs tracking-wider"
          >
            Buka Akses VIP Sekarang
          </button>
        </div>
      )}

      {/* Header section signals */}
      <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/10 rounded-xl text-green-400 border border-green-500/20">
            <TrendingUp size={18} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white tracking-tight uppercase">Live Trading Signals</h3>
            <p className="text-[10px] text-neutral-500 font-bold">Update real-time setiap hari</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
          <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Live</span>
        </div>
      </div>

      {/* Daftar sinyal */}
      <div className="p-6 pt-4 space-y-3">
        {[
          { pair: 'BTC / USDT', signal: 'HIDDEN_SIGNAL', icon: '₿' },
          { pair: 'ETH / USDT', signal: 'HIDDEN_SIGNAL', icon: 'Ξ' },
          { pair: 'SOL / USDT', signal: 'HIDDEN_SIGNAL', icon: '◎' },
        ].map((item) => (
          <div key={item.pair} className="flex items-center justify-between px-5 py-4 bg-neutral-950/60 border border-neutral-800 rounded-xl group hover:border-neutral-700 transition-all">
            <div className="flex items-center gap-3">
              <span className="text-base font-black text-yellow-500/60 w-6 text-center">{item.icon}</span>
              <span className="font-extrabold text-neutral-300 tracking-widest uppercase text-sm">{item.pair}</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={12} className="text-neutral-700" />
              <span className="text-neutral-700 font-mono italic text-xs tracking-[0.3em]">{item.signal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
