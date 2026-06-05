import React from "react";
import Image from "next/image";
import { Check } from "lucide-react";

export default function MindsetSelection() {
  return (
    <section id="mindset" className="relative overflow-hidden bg-[#0b0b0b] py-16 md:py-24">
      {/* Ambient glow tipis di latar belakang */}
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/[0.012] rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-4xl text-center mb-16 md:mb-20">
          {/* HEADLINE UTAMA: Gaya Editorial Majalah (Sans-serif Tipis + Serif Miring Emas) */}
          <span className="text-xs uppercase tracking-[0.25em] text-neutral-450 font-bold mb-3 block">
            KAMU ADA DI TIPE MANA?
          </span>
          <h2 className="text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-neutral-300 leading-tight tracking-tight">
            Bergabunglah Bersama Kami di{" "}
            <span className="block mt-2 font-serif-editorial italic text-[#d4af37] font-normal drop-shadow-[0_2px_15px_rgba(212,175,55,0.15)]">
              imperiumcrypto.id, Fondasi Awal Langkahmu.
            </span>
          </h2>
        </div>

        {/* GRID DUA KARTU DENGAN OVERLAY TEKS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto">
          
          {/* KARTU 1: Yang Ragu & Skeptis (Skeptisisme Redup / Magenta Aksen) */}
          <div className="relative group rounded-3xl border border-white/[0.05] bg-[#020202] overflow-hidden aspect-[4/5] md:aspect-[3/4] transition-all duration-500 hover:border-purple-500/25 hover:shadow-[0_0_40px_rgba(168,85,247,0.06)] cursor-pointer">
            {/* Gambar Background Ragu */}
            <Image
              src="/path_skeptic.png"
              alt="Tipe Ragu & Skeptis"
              fill
              className="object-cover opacity-60 filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
              sizes="(max-w-768px) 100vw, 50vw"
              priority
            />
            {/* Overlay Gradasi Gelap yang Tebal di Bawah */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
            
            {/* Konten Teks Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 z-20">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug">
                Pengetahuan yang kamu pelajari tidak pernah membuatmu gagal.
              </p>
            </div>
          </div>

          {/* KARTU 2: Yang Berani Bertindak (Pemberani Terang / Emas Aksen) */}
          <div className="relative group rounded-3xl border border-[#d4af37]/25 bg-[#020202] overflow-hidden aspect-[4/5] md:aspect-[3/4] transition-all duration-500 hover:border-[#d4af37]/50 hover:shadow-[0_0_45px_rgba(212,175,55,0.1)] cursor-pointer">
            {/* Badge Centang Biru di atas kartu */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-30 flex items-center justify-center">
              <div className="w-8 h-8 rounded-full bg-[#00e1ff] text-black flex items-center justify-center shadow-[0_0_20px_rgba(0,225,255,0.6)]">
                <Check className="w-5 h-5 stroke-[3.5]" />
              </div>
            </div>

            {/* Gambar Background Berani */}
            <Image
              src="/path_action.png"
              alt="Tipe Berani Mengambil Risiko"
              fill
              className="object-cover opacity-70 filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
              sizes="(max-w-768px) 100vw, 50vw"
              priority
            />
            {/* Overlay Gradasi Gelap yang Tebal di Bawah */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />

            {/* Konten Teks Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 z-20">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold tracking-tight text-white leading-snug">
                Tapi keberanian mengambil risiko adalah fondasi awal menuju kesuksesan.
              </p>
            </div>
          </div>

        </div>

        {/* Pembatas Section Berbentuk Sirkuit Emas Redup (Circuit Divider) */}
        <div className="flex items-center justify-center gap-4 mt-16 md:mt-24">
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-r from-transparent to-yellow-500/20" />
          <div className="w-2.5 h-2.5 rounded-full border border-yellow-500 bg-[#020202] shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" />
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-l from-transparent to-yellow-500/20" />
        </div>
      </div>
    </section>
  );
}
