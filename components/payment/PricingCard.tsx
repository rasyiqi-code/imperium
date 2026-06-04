'use client'

import { PaketVIP } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'

interface PricingCardProps {
  paket: PaketVIP;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isActivePackage?: boolean;
  upgradeMode?: string;
}

export default function PricingCard({ 
  paket, 
  isSelected, 
  onSelect, 
  isActivePackage = false, 
  upgradeMode = 'stacking' 
}: PricingCardProps) {
  return (
    <div 
      onClick={() => {
        if (!isActivePackage) onSelect(paket.id)
      }}
      className={`p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${
        isActivePackage
          ? 'border-neutral-800 bg-neutral-950 opacity-70 cursor-not-allowed'
          : isSelected 
            ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)] cursor-pointer' 
            : 'border-neutral-800 bg-neutral-900/50 cursor-pointer'
      }`}
    >
      {isActivePackage ? (
        <div className="absolute top-0 right-0 bg-neutral-800 text-neutral-400 px-4 py-1 text-[10px] font-black rounded-bl-xl uppercase tracking-tighter">
          Paket Aktif
        </div>
      ) : isSelected ? (
        <div className="absolute top-0 right-0 bg-yellow-500 text-black px-4 py-1 text-[10px] font-black rounded-bl-xl uppercase tracking-tighter">
          Terpilih
        </div>
      ) : null}
      
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
          {paket.nama_paket}
        </span>
        <div className="text-2xl font-black text-white">
          Rp {paket.harga.toLocaleString('id-ID')}
        </div>
        
        {isActivePackage ? (
          <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-tight mt-1 leading-normal">
            Anda sedang aktif menggunakan paket ini
          </div>
        ) : (
          <div className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-tight mt-1.5 leading-normal italic">
            {upgradeMode === 'proration' 
              ? '*Harga akan dipotong (prorasi) dari sisa hari aktif Anda saat bayar.' 
              : '*Durasi paket akan diakumulasi dengan sisa masa aktif Anda.'}
          </div>
        )}

        <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mt-2">
          Durasi: {paket.durasi_hari} Hari
        </div>
      </div>

      <div className="mt-5 pt-5 border-t border-neutral-800/50 space-y-3">
        {paket.fitur.map((f, i) => (
          <div key={i} className="flex items-center gap-3 text-[11px] text-neutral-400 font-medium">
            <div className="shrink-0 w-5 h-5 rounded-full bg-yellow-500/10 flex items-center justify-center text-yellow-500">
               <CheckCircle2 size={12} strokeWidth={3} />
            </div>
            {f}
          </div>
        ))}
      </div>
    </div>
  )
}