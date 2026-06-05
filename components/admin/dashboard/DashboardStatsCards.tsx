'use client'

import React from 'react'
import { Users, TrendingUp, Wallet } from 'lucide-react'

interface DashboardStatsCardsProps {
  totalUser: number
  vipAktif: number
  omzet: number
}

export default function DashboardStatsCards({ totalUser, vipAktif, omzet }: DashboardStatsCardsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-left">
      {/* Total Users */}
      <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 hover:border-neutral-700/50 shadow-lg shadow-black/20 rounded-2xl relative overflow-hidden group transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-20 h-20 bg-blue-500/5 blur-xl rounded-full pointer-events-none group-hover:bg-blue-500/10 transition-all duration-300" />
        <div className="h-10 w-10 bg-blue-500/5 border border-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
          <Users size={18} />
        </div>
        <div className="text-2xl font-bold leading-none tracking-tight text-white">{totalUser}</div>
        <div className="text-[10px] font-black text-neutral-500 tracking-widest mt-2.5">Pendaftar</div>
      </div>

      {/* VIP Active */}
      <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 hover:border-neutral-700/50 shadow-lg shadow-black/20 rounded-2xl relative overflow-hidden group transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-20 h-20 bg-green-500/5 blur-xl rounded-full pointer-events-none group-hover:bg-green-500/10 transition-all duration-300" />
        <div className="h-10 w-10 bg-green-500/5 border border-green-500/20 text-green-400 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
          <TrendingUp size={18} />
        </div>
        <div className="text-2xl font-bold leading-none tracking-tight text-green-400">{vipAktif}</div>
        <div className="text-[10px] font-black text-neutral-500 tracking-widest mt-2.5">VIP Aktif</div>
      </div>

      {/* Total Omzet */}
      <div className="p-5 bg-neutral-950/40 backdrop-blur-md border border-neutral-800/80 hover:border-neutral-700/50 shadow-lg shadow-black/20 rounded-2xl col-span-2 md:col-span-1 relative overflow-hidden group transition-all duration-300">
        <div className="absolute -right-6 -top-6 w-20 h-20 bg-yellow-500/5 blur-xl rounded-full pointer-events-none group-hover:bg-yellow-500/10 transition-all duration-300" />
        <div className="h-10 w-10 bg-yellow-500/5 border border-yellow-500/20 text-yellow-500 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-105 duration-300">
          <Wallet size={18} />
        </div>
        <div className="text-2xl font-bold leading-none tracking-tight text-yellow-500">
          Rp {omzet.toLocaleString('id-ID')}
        </div>
        <div className="text-[10px] font-black text-neutral-500 tracking-widest mt-2.5">Total Omzet</div>
      </div>
    </div>
  )
}
