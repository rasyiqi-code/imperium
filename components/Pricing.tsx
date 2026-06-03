'use client'

import React, { useEffect, useState } from 'react';
import { Check, Crown, RefreshCw, Zap, X } from "lucide-react";
import { supabase } from '@/lib/supabase';
import { PaketVIP } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function Pricing() {
  const [paketList, setPaketList] = useState<PaketVIP[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadPaket() {
      try {
        const res = await fetch('/api/packages')
        const data = await res.json()
        if (res.ok && data.packages) {
          setPaketList(data.packages as PaketVIP[])
        }
      } catch (err) {
        console.error("Gagal memuat paket VIP:", err)
      } finally {
        setLoading(false)
      }
    }
    loadPaket();
  }, []);

  // Fungsi navigasi berdasarkan status login
  const handleAction = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      router.push('/dashboard/upgrade');
    } else {
      router.push('/register');
    }
  };

  if (loading) return (
    <div className="py-24 flex justify-center items-center bg-[#0b0b0b] relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-yellow-500/[0.05] rounded-full blur-[60px] pointer-events-none" />
      <RefreshCw className="animate-spin text-yellow-500 relative z-10" size={32} />
    </div>
  );

  return (
    <section id="pricing" className="relative overflow-hidden py-24 md:py-32 bg-[#0b0b0b]">
      {/* Ambient glow redup di belakang grid */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/[0.02] rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
        
        <div className="mx-auto max-w-3xl mb-20">
          <h2 className="mb-6 text-balance text-3xl font-black md:text-5xl text-center leading-tight tracking-tight">
            Membership{" "}
            <span className="block mt-2 text-center bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(234,179,8,0.15)]">
              Imperium Crypto
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-sm md:text-base leading-relaxed text-neutral-400 text-center">
            Dapatkan akses sinyal harian dan belajar Crypto secara profesional bersama komunitas eksklusif.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
          
          {/* 1. PAKET GRATIS (Static) */}
          <div className="group relative flex flex-col rounded-3xl p-8 border border-white/[0.06] bg-[#0d0d0d]/40 backdrop-blur-md transition-all duration-300 hover:border-yellow-500/25 hover:bg-yellow-500/[0.01] hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(234,179,8,0.02)] h-full overflow-hidden">
            
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 rounded-2xl bg-neutral-800/40 text-neutral-400 border border-neutral-800/60 group-hover:border-neutral-700 transition-colors">
                <Zap size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">Entry Level</span>
            </div>

            <div className="text-left mb-8">
              <h4 className="text-xl font-bold text-white uppercase tracking-tight mb-2">Free Plan</h4>
              <div className="flex items-baseline">
                <span className="text-4xl font-black text-white">Rp 0</span>
                <span className="text-neutral-500 ml-2 text-xs font-bold uppercase tracking-widest">/ Selamanya</span>
              </div>
            </div>

            <ul className="mb-10 space-y-4 grow text-left border-t border-white/[0.06] pt-8">
              <li className="flex items-center text-neutral-300">
                <Check className="mr-3 shrink-0 text-yellow-500/50" size={16} strokeWidth={4} />
                <span className="text-xs font-bold uppercase tracking-tight">Gabung Grup Diskusi Publik</span>
              </li>
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center text-neutral-600 opacity-40">
                  <X className="mr-3 shrink-0 text-red-500/60" size={16} strokeWidth={4} />
                  <span className="text-xs font-bold uppercase tracking-tight text-neutral-500 line-through">Fitur VIP Terkunci</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleAction}
              className="relative group overflow-hidden w-full py-4.5 rounded-2xl font-bold text-xs uppercase tracking-[0.2em] border border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-400 transition-all duration-300 active:scale-[0.98]"
            >
              Mulai Gratis
            </button>
          </div>

          {/* 2 & 3. PAKET VIP (Dinamis dari Database) */}
          {paketList.map((paket) => (
            <LandingPricingCard key={paket.id} paket={paket} onAction={handleAction} />
          ))}

        </div>
      </div>
    </section>
  );
}

function LandingPricingCard({ paket, onAction }: { paket: PaketVIP, onAction: () => void }) {
  const isYearly = paket.durasi_hari > 200;

  return (
    <div className={`group relative flex flex-col rounded-3xl p-8 transition-all duration-500 h-full overflow-hidden ${
      isYearly 
      ? 'border-2 border-yellow-500/70 bg-[#111111]/80 backdrop-blur-md animate-breathe hover:scale-[1.03] z-10' 
      : 'border border-white/[0.06] bg-[#0d0d0d]/40 backdrop-blur-md hover:border-yellow-500/25 hover:bg-yellow-500/[0.01] hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(234,179,8,0.02)]'
    }`}>
      
      {isYearly && (
        <>
          <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-yellow-400 px-6 py-2 text-[10px] font-black uppercase text-black rounded-bl-3xl tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.3)] z-20">
            Recommended
          </div>
          {/* Node Emas Aktif Berdenyut di Sudut Kanan Atas */}
          <div className="absolute top-16 right-6 flex h-2 w-2 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/60 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500/80"></span>
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className={`p-4 rounded-2xl border transition-colors ${
          isYearly 
          ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 group-hover:bg-yellow-500/20' 
          : 'bg-[#0d0d0d] text-yellow-500 border-white/[0.06] group-hover:border-yellow-500/20'
        }`}>
          <Crown size={24} />
        </div>
        <span className={`text-xs font-black uppercase tracking-[0.2em] ${isYearly ? 'text-yellow-400' : 'text-neutral-400'}`}>
          VIP {isYearly ? 'Elite' : 'Basic'}
        </span>
      </div>

      <div className="text-left mb-8">
        <h4 className="text-xl font-bold text-white uppercase tracking-tight mb-2">{paket.nama_paket}</h4>
        <div className="flex items-baseline">
          <span className="text-4xl font-black text-white">Rp {paket.harga.toLocaleString('id-ID')}</span>
          <span className="text-neutral-500 ml-2 text-xs font-bold uppercase tracking-widest">/ {paket.durasi_hari} Hari</span>
        </div>
      </div>

      <ul className="mb-10 space-y-4 grow text-left border-t border-white/[0.06] pt-8">
        {paket.fitur && paket.fitur.length > 0 ? (
          paket.fitur.map((feature, index) => (
            <li key={index} className="flex items-center text-neutral-300">
              <Check className={`mr-3 shrink-0 ${isYearly ? 'text-yellow-400' : 'text-yellow-500/60'}`} size={16} strokeWidth={4} />
              <span className="text-xs font-bold uppercase tracking-tight">{feature}</span>
            </li>
          ))
        ) : (
          <li className="text-neutral-500 text-xs italic uppercase">Fitur paket VIP tidak tersedia</li>
        )}
      </ul>

      <button 
        onClick={onAction}
        className={`relative group overflow-hidden w-full py-4.5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] ${
          isYearly 
          ? 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(234,179,8,0.35)]' 
          : 'border border-yellow-500/20 bg-yellow-500/5 text-yellow-400 hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-400'
        }`}
      >
        {isYearly && (
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
        )}
        Dapatkan Akses VIP
      </button>
    </div>
  );
}