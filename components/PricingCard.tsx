'use client'

import { PaketVIP } from '@/lib/types'
import { CheckCircle2 } from 'lucide-react'

interface PricingCardProps {
  paket: PaketVIP;
  isSelected: boolean;
  onSelect: (id: string) => void;
  proratedHarga?: number;
}

export default function PricingCard({ paket, isSelected, onSelect, proratedHarga }: PricingCardProps) {
  return (
    <div 
      onClick={() => onSelect(paket.id)}
      className={`cursor-pointer p-6 rounded-3xl border-2 transition-all relative overflow-hidden ${
        isSelected 
          ? 'border-yellow-500 bg-yellow-500/5 shadow-[0_0_20px_rgba(234,179,8,0.1)]' 
          : 'border-neutral-800 bg-neutral-900/50'
      }`}
    >
      {isSelected && (
        <div className="absolute top-0 right-0 bg-yellow-500 text-black px-4 py-1 text-[10px] font-black rounded-bl-xl uppercase tracking-tighter">
          Terpilih
        </div>
      )}
      
      <div className="flex flex-col gap-1">
        <span className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">
          {paket.nama_paket}
        </span>
        <div className="text-2xl font-black text-white flex items-baseline gap-2 flex-wrap">
          {proratedHarga && proratedHarga < paket.harga ? (
            <>
              <span className="text-yellow-500">Rp {proratedHarga.toLocaleString('id-ID')}</span>
              <span className="text-sm font-bold text-neutral-500 line-through">Rp {paket.harga.toLocaleString('id-ID')}</span>
            </>
          ) : (
            <span>Rp {paket.harga.toLocaleString('id-ID')}</span>
          )}
        </div>
        <div className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mt-1">
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