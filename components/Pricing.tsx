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

  // Mengurutkan paket agar VIP Elite/Yearly selalu di kanan
  const sortedPaketList = [...paketList].sort((a, b) => a.harga - b.harga);

  return (
    <section id="pricing" className="relative overflow-hidden pt-12 pb-0 md:pt-16 md:pb-0 bg-[#0b0b0b]">
      {/* Ambient glow tipis di latar belakang */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/[0.015] rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 text-center">
        
        {/* JUDUL UTAMA: Gaya Editorial Majalah (Sans-serif Tipis + Serif Miring Emas) */}
        <div className="mx-auto max-w-3xl mb-16 text-center">
          <h2 className="mb-6 text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-neutral-300 leading-tight tracking-tight">
            Membership{" "}
            <span className="block mt-2 font-serif-editorial italic text-[#d4af37] font-normal drop-shadow-[0_2px_15px_rgba(212,175,55,0.1)]">
              Imperium Crypto
            </span>
          </h2>
          <p className="mx-auto max-w-xl text-sm md:text-base leading-relaxed text-neutral-455 text-center">
            Dapatkan akses sinyal harian dan belajar Crypto secara profesional bersama komunitas eksklusif.
          </p>
        </div>

        {/* KARTU PRICING TERPISAH (Gaya Luxury Card, rounded-2xl, gap-6/8) */}
        <div className="grid grid-cols-1 gap-6 md:gap-8 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
          
          {/* 1. PAKET GRATIS (Static) */}
          <div className="group relative flex flex-col p-6 md:p-8 rounded-2xl border border-white/[0.08] bg-[#0d0d0d]/40 backdrop-blur-md transition-all duration-300 hover:border-yellow-500/20 hover:bg-yellow-500/[0.005] h-full overflow-hidden">
            
            <div className="flex items-center justify-between mb-8">
              <div className="p-3 rounded-xl bg-neutral-800/20 text-neutral-400 border border-neutral-800/40 group-hover:border-neutral-700 transition-colors">
                <Zap size={20} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Entry Level</span>
            </div>

            <div className="text-left mb-8">
              <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-2">Free Plan</h4>
              <div className="flex items-baseline">
                <span className="text-3xl font-black text-white">Rp 0</span>
                <span className="text-neutral-500 ml-2 text-[10px] font-bold uppercase tracking-widest">/ Selamanya</span>
              </div>
            </div>

            <ul className="mb-10 space-y-4 grow text-left border-t border-white/[0.06] pt-8">
              <li className="flex items-center text-neutral-300">
                <Check className="mr-3 shrink-0 text-[#d4af37]/60" size={15} strokeWidth={4} />
                <span className="text-[11px] font-bold uppercase tracking-tight">Gabung Grup Diskusi Publik</span>
              </li>
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center text-neutral-600 opacity-20">
                  <X className="mr-3 shrink-0 text-red-500/40" size={15} strokeWidth={4} />
                  <span className="text-[11px] font-bold uppercase tracking-tight text-neutral-500 line-through">Fitur VIP Terkunci</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={handleAction}
              className="relative w-full py-4 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] border border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:border-[#d4af37]/45 hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-all duration-300 active:scale-[0.98]"
            >
              Mulai Gratis
            </button>
          </div>

          {/* 2 & 3. PAKET VIP (Dinamis dari Database) */}
          {sortedPaketList.map((paket) => (
            <LandingPricingCard 
              key={paket.id} 
              paket={paket} 
              onAction={handleAction} 
            />
          ))}

        </div>

        {/* Pembatas Section Berbentuk Sirkuit Emas Redup (Circuit Divider) */}
        <div className="flex items-center justify-center gap-4 mt-12 md:mt-16">
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-r from-transparent to-yellow-500/20" />
          {/* Node Sirkuit yang berdenyut */}
          <div className="w-2.5 h-2.5 rounded-full border border-yellow-500 bg-[#020202] shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" />
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-l from-transparent to-yellow-500/20" />
        </div>

      </div>
    </section>
  );
}

function LandingPricingCard({ 
  paket, 
  onAction
}: { 
  paket: PaketVIP;
  onAction: () => void;
}) {
  const isYearly = paket.durasi_hari > 200;

  // Fallback cerdas jika data fitur dari database kosong agar tampilan tetap premium
  const defaultFeatures = isYearly 
    ? [
        "Akses Grup VIP Discord",
        "Sinyal VIP Harian Akurat",
        "E-Book & Panduan Premium",
        "Analisis Riset Data-Driven",
        "Mentorship Prioritas & Konsultasi 1-on-1"
      ]
    : [
        "Akses Grup VIP Discord",
        "Sinyal VIP Harian Harian",
        "E-Book & Panduan Premium",
        "Analisis Riset Data-Driven"
      ];

  const featuresToRender = paket.fitur && paket.fitur.length > 0 ? paket.fitur : defaultFeatures;

  return (
    <div className={`group relative flex flex-col p-6 md:p-8 rounded-2xl transition-all duration-500 h-full overflow-hidden border ${
      isYearly 
      ? 'border-[#d4af37]/40 bg-[#111111]/70 shadow-[0_0_35px_rgba(212,175,55,0.06)] hover:shadow-[0_0_45px_rgba(212,175,55,0.15)] animate-breathe hover:scale-[1.02] z-10' 
      : 'border-white/[0.08] bg-[#0d0d0d]/40 backdrop-blur-md hover:border-yellow-500/20 hover:bg-[#d4af37]/[0.005]'
    }`}>
      
      {isYearly && (
        <>
          <div className="absolute top-0 right-0 bg-[#d4af37] px-4 py-1.5 text-[9px] font-black uppercase text-black tracking-widest rounded-bl-xl shadow-[0_2px_10px_rgba(212,175,55,0.2)] z-20 select-none">
            Recommended
          </div>
          {/* Node Emas Aktif Berdenyut di Sudut Kanan Atas */}
          <div className="absolute top-16 right-6 flex h-1.5 w-1.5 z-20">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/60 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/85"></span>
          </div>
        </>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className={`p-3 rounded-xl border transition-colors ${
          isYearly 
          ? 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20 group-hover:bg-[#d4af37]/20' 
          : 'bg-neutral-800/10 text-[#d4af37] border-white/[0.06] group-hover:border-[#d4af37]/20'
        }`}>
          <Crown size={20} />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isYearly ? 'text-[#d4af37]' : 'text-neutral-450'}`}>
          VIP {isYearly ? 'Elite' : 'Basic'}
        </span>
      </div>

      <div className="text-left mb-8">
        <h4 className="text-lg font-bold text-white uppercase tracking-tight mb-2">{paket.nama_paket}</h4>
        <div className="flex items-baseline">
          <span className="text-3xl font-black text-white">Rp {paket.harga.toLocaleString('id-ID')}</span>
          <span className="text-neutral-500 ml-2 text-[10px] font-bold uppercase tracking-widest">/ {paket.durasi_hari} Hari</span>
        </div>
      </div>

      <ul className="mb-10 space-y-4 grow text-left border-t border-white/[0.06] pt-8">
        {featuresToRender.map((feature, index) => (
          <li key={index} className="flex items-center text-neutral-300">
            <Check className={`mr-3 shrink-0 ${isYearly ? 'text-[#d4af37]' : 'text-[#d4af37]/60'}`} size={15} strokeWidth={4} />
            <span className="text-[11px] font-bold uppercase tracking-tight">{feature}</span>
          </li>
        ))}
      </ul>

      <button 
        onClick={onAction}
        className={`relative group overflow-hidden w-full py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all duration-300 active:scale-[0.98] ${
          isYearly 
          ? 'bg-[#d4af37] text-black hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(212,175,55,0.25)]' 
          : 'border border-[#d4af37]/25 bg-[#d4af37]/5 text-[#d4af37] hover:border-[#d4af37]/45 hover:bg-[#d4af37]/10'
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