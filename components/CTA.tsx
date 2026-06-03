'use client'

import React from 'react';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24 bg-[#0b0b0b] text-center border-t border-white/[0.04]">
      {/* Background ambient gold glow */}
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-yellow-500/[0.025] rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 space-y-8">
        
        {/* Title */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-light text-neutral-300 tracking-tight leading-tight uppercase">
          Siap Menguasai Pasar Crypto? <br />
          <span className="block mt-2 font-serif-editorial italic text-[#d4af37] font-normal drop-shadow-[0_2px_15px_rgba(212,175,55,0.15)]">
            Mulai Perjalanan VIP Anda Sekarang
          </span>
        </h2>

        {/* Subtitle */}
        <p className="mx-auto max-w-xl text-sm md:text-base leading-relaxed text-neutral-400 font-medium">
          Dapatkan akses instan ke sinyal pasar presisi, e-book premium, dan komunitas diskusi privat bersama ratusan trader elit lainnya.
        </p>

        {/* CTA Button */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xs mx-auto sm:max-w-none">
          <Link 
            href="/register"
            className="group relative overflow-hidden w-full sm:w-auto text-center px-8 py-4 bg-[#d4af37] hover:bg-[#b8962e] text-black font-black text-xs uppercase tracking-[0.2em] rounded-full transition-all duration-300 hover:scale-105 active:scale-95 shadow-[0_10px_30px_rgba(212,175,55,0.15)] hover:shadow-[0_10px_40px_rgba(212,175,55,0.35)]"
          >
            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
            Gabung Sekarang
          </Link>
          <Link 
            href="/#pricing"
            className="w-full sm:w-auto text-center px-8 py-4 border border-white/[0.08] bg-white/[0.02] text-neutral-300 hover:border-[#d4af37]/45 hover:bg-[#d4af37]/10 hover:text-[#d4af37] font-black text-xs uppercase tracking-[0.2em] rounded-full transition-all duration-300 active:scale-95"
          >
            Lihat Paket VIP
          </Link>
        </div>
      </div>
    </section>
  );
}
