'use client'

import React from 'react'
import { Gem, Calendar } from 'lucide-react'

interface ProfileVipStatusCardProps {
  statusVip: string
  masaAktif: string | null
}

export default function ProfileVipStatusCard({ statusVip, masaAktif }: ProfileVipStatusCardProps) {
  const isVip = statusVip === 'VIP Member'

  return (
    <div className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-500 ${
      isVip 
        ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.05)]' 
        : 'bg-neutral-900/50 border-neutral-800'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
          isVip ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-neutral-800 text-neutral-500'
        }`}>
          <Gem size={18} />
        </div>
        <div>
          <div className="text-[9px] font-bold tracking-widest text-neutral-500 uppercase">Membership</div>
          <div className={`text-xs font-extrabold tracking-tight ${isVip ? 'text-yellow-400' : 'text-white'}`}>
            {statusVip}
          </div>
        </div>
      </div>
      {isVip && masaAktif && (
        <div className="text-right">
          <div className="text-[9px] font-bold tracking-widest text-neutral-500 uppercase flex items-center justify-end gap-1">
            <Calendar size={9} /> Expired
          </div>
          <div className="text-[10px] font-bold text-white mt-0.5">
            {new Date(masaAktif).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  )
}
