'use client'

import { Clock, Hammer, ShieldAlert } from 'lucide-react'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-white font-sans text-center relative overflow-hidden">
      {/* Background radial gradient decoration */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-950/40 border border-neutral-900 backdrop-blur-xl relative z-10 flex flex-col items-center shadow-2xl">
        <div className="h-16 w-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center text-yellow-500 border border-yellow-500/20 mb-6 animate-pulse">
          <Hammer size={32} />
        </div>

        <h1 className="text-2xl font-black uppercase tracking-tight leading-tight italic">
          PEMELIHARAAN <span className="text-yellow-500">SISTEM</span>
        </h1>
        
        <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest mt-3 flex items-center gap-1.5 justify-center leading-none">
          <Clock size={12} /> Under Maintenance
        </p>

        <div className="w-full h-px bg-neutral-900 my-6" />

        <p className="text-xs text-neutral-400 font-bold uppercase tracking-wide leading-relaxed">
          Kami sedang melakukan peningkatan performa dan pemeliharaan server berkala untuk menyajikan layanan yang lebih optimal.
        </p>

        <p className="text-[10px] text-neutral-600 font-black uppercase tracking-widest mt-6 leading-none">
          Imperium Crypto VIP Portal
        </p>
      </div>
      
      <div className="mt-8 flex items-center gap-2 text-[10px] text-neutral-600 font-bold uppercase tracking-widest z-10">
        <ShieldAlert size={12} className="text-yellow-500/50" />
        <span>Sinyal & Komunitas Akan Segera Kembali</span>
      </div>
    </div>
  )
}
