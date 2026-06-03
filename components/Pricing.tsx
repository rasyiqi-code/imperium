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
    <div className="py-20 flex justify-center items-center bg-[#0a0a0a]">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  );

  return (
    <section id="pricing" className="bg-[#0a0a0a] py-20 md:py-28 font-sans">
      <div className="mx-auto max-w-7xl px-6 text-center">
        
        <div className="mx-auto max-w-3xl mb-16">
          <h2 className="mb-4 text-3xl font-black md:text-5xl text-white tracking-tighter">
            Membership <span className="text-yellow-500">Imperium Crypto</span>
          </h2>
          <p className="text-sm text-neutral-500">
            Dapatkan akses sinyal harian dan belajar Crypto secara profesional bersama komunitas eksklusif.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 max-w-6xl mx-auto items-stretch">
          
          {/* 1. PAKET GRATIS (Static) - Ditambahkan h-full agar tinggi kartu sama rata di desktop */}
          <div className="relative flex flex-col rounded-2xl p-8 border border-neutral-900 bg-[#0d0d0d] transition-all hover:border-neutral-800 h-full">
            <div className="flex items-center justify-between mb-8">
              <div className="p-4 rounded-2xl bg-neutral-800 text-neutral-500">
                <Zap size={24} />
              </div>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-neutral-600">Entry Level</span>
            </div>
            <div className="text-left mb-8">
              <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">Free Plan</h4>
              <div className="flex items-baseline">
                <span className="text-4xl font-black text-white">Rp 0</span>
                <span className="text-neutral-600 ml-2 text-xs font-bold uppercase tracking-widest">/ Selamanya</span>
              </div>
            </div>
            <ul className="mb-10 space-y-4 grow text-left border-t border-neutral-800/50 pt-8">
              <li className="flex items-center text-neutral-300">
                <Check className="mr-3 shrink-0 text-neutral-500" size={16} strokeWidth={4} />
                <span className="text-xs font-bold uppercase tracking-tight">Gabung Grup Diskusi Publik</span>
              </li>
              {[1, 2, 3, 4].map((i) => (
                <li key={i} className="flex items-center text-neutral-700 opacity-30">
                  <X className="mr-3 shrink-0 text-red-400" size={16} strokeWidth={4} />
                  <span className="text-xs font-bold uppercase tracking-tight text-gray-200 line-through">Fitur VIP Terkunci</span>
                </li>
              ))}
            </ul>
            <button 
              onClick={handleAction}
              className="w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-neutral-800 text-white hover:bg-white hover:text-black transition-all"
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
    // Menggunakan h-full agar sejajar, dan mengganti scale statis menjadi hover scale agar baseline kartu lurus saat render pertama
    <div className={`relative flex flex-col rounded-2xl p-8 transition-all duration-500 h-full ${
      isYearly 
      ? 'border-2 border-yellow-500 bg-[#111111] shadow-[0_0_50px_rgba(234,179,8,0.1)] hover:scale-[1.03] z-10' 
      : 'border border-neutral-800 bg-[#0d0d0d] hover:border-neutral-700 hover:scale-[1.01]'
    }`}>
      
      {isYearly && (
        <div className="absolute top-0 right-0 bg-yellow-500 px-6 py-1.5 text-xs font-black uppercase text-black rounded-bl-2xl tracking-widest">
          Recommended
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div className={`p-4 rounded-2xl ${isYearly ? 'bg-yellow-500 text-black' : 'bg-neutral-800 text-yellow-500'}`}>
          <Crown size={24} />
        </div>
        <span className={`text-xs font-black uppercase tracking-[0.2em] ${isYearly ? 'text-yellow-500' : 'text-neutral-500'}`}>
          VIP {isYearly ? 'Elite' : 'Basic'}
        </span>
      </div>

      <div className="text-left mb-8">
        <h4 className="text-xl font-black text-white uppercase tracking-tight mb-2">{paket.nama_paket}</h4>
        <div className="flex items-baseline">
          <span className="text-4xl font-black text-white">Rp {paket.harga.toLocaleString('id-ID')}</span>
          <span className="text-neutral-500 ml-2 text-xs font-bold uppercase tracking-widest">/ {paket.durasi_hari} Hari</span>
        </div>
      </div>

      <ul className="mb-10 space-y-4 grow text-left border-t border-neutral-800/50 pt-8">
        {paket.fitur && paket.fitur.length > 0 ? (
          paket.fitur.map((feature, index) => (
            <li key={index} className="flex items-center text-neutral-300">
              <Check className={`mr-3 shrink-0 ${isYearly ? 'text-yellow-500' : 'text-yellow-500/50'}`} size={16} strokeWidth={4} />
              <span className="text-xs font-bold uppercase tracking-tight">{feature}</span>
            </li>
          ))
        ) : (
          <li className="text-neutral-500 text-xs italic uppercase">Fitur paket VIP tidak tersedia</li>
        )}
      </ul>

      <button 
        onClick={onAction}
        className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 ${
          isYearly 
          ? 'bg-yellow-500 text-black hover:bg-yellow-400 shadow-[0_10px_20px_rgba(234,179,8,0.2)]' 
          : 'bg-white text-black hover:bg-neutral-200'
        }`}
      >
        Dapatkan Akses VIP
      </button>
    </div>
  );
}