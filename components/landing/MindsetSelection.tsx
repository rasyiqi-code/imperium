import React from "react";
import Image from "next/image";

export default function MindsetSelection() {
  return (
    <section id="mindset" className="relative overflow-hidden bg-black py-16 md:py-24">
      {/* Ambient glow tipis di latar belakang */}
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/[0.015] rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-5xl px-6">
        
        {/* HEADER DENGAN GARIS PEMBATAS */}
        <div className="w-full flex items-center justify-center gap-4 mb-4">
          <div className="h-[1px] flex-grow bg-white/10 max-w-[200px]" />
          <span className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-[#8c7321] font-bold whitespace-nowrap">
            KAMU ADA DI TIPE MANA?
          </span>
          <div className="h-[1px] flex-grow bg-white/10 max-w-[200px]" />
        </div>

        {/* JUDUL UTAMA */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight">
            di Dunia ini Ada 2 Tipe Orang,
          </h2>
        </div>

        {/* GRID DUA KARTU KOMPARATIF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10 max-w-3xl mx-auto">
          
          {/* KARTU 1 (KIRI): Yang Berani Bertindak (Centang Biru, Aksen Cyan/Biru) */}
          <div className="relative group rounded-3xl border border-[#00d9ff]/30 bg-[#070707] overflow-hidden aspect-[4/5] transition-all duration-500 hover:border-[#00d9ff]/70 hover:shadow-[0_0_40px_rgba(0,217,255,0.12)] cursor-pointer">
            {/* Badge Verified Centang Biru di Atas Tengah */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30">
              <svg className="w-8 h-8 text-[#00d9ff] fill-current drop-shadow-[0_0_8px_rgba(0,217,255,0.6)]" viewBox="0 0 24 24">
                <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.7l-3.61.81.34 3.7L1 12l2.44 2.79-.34 3.69 3.61.82 1.89 3.2L12 21.04l3.4 1.46 1.89-3.2 3.61-.82-.34-3.69L23 12zm-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
              </svg>
            </div>

            <Image
              src="/path_action_v2.png"
              alt="Orang Yang Mau Melompat"
              fill
              className="object-cover opacity-80 filter grayscale-[20%] group-hover:grayscale-0 group-hover:scale-[1.03] transition-all duration-700 pointer-events-none"
              sizes="(max-w-768px) 100vw, 50vw"
              priority
            />
            {/* Overlay Gradasi Gelap yang Tebal di Bawah */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10" />

            {/* Konten Teks Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-20">
              <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white leading-snug">
                Keberanian melangkah{" "}
                <span className="underline decoration-[#00d9ff] decoration-2 underline-offset-4">
                  adalah awal dari segala arah.
                </span>
              </p>
            </div>
          </div>

          {/* KARTU 2 (KANAN): Yang Ragu & Skeptis (Tanpa Badge, Aksen Purple/Pink) */}
          <div className="relative group rounded-3xl border border-purple-500/25 bg-[#070707] overflow-hidden aspect-[4/5] transition-all duration-500 hover:border-purple-500/50 hover:shadow-[0_0_35px_rgba(168,85,247,0.08)] cursor-pointer">
            {/* Gambar Background Ragu */}
            <Image
              src="/path_skeptic_v2.png"
              alt="Orang Yang Mau Berdiam Diri"
              fill
              className="object-cover opacity-60 filter grayscale-[40%] group-hover:grayscale-[10%] group-hover:scale-[1.03] transition-all duration-700 pointer-events-none"
              sizes="(max-w-768px) 100vw, 50vw"
              priority
            />
            {/* Overlay Gradasi Gelap yang Tebal di Bawah */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent z-10" />
            
            {/* Konten Teks Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 z-20">
              <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-neutral-200 leading-snug">
                Ilmu yang dipelajari takkan pernah menjadi rugi.
              </p>
            </div>
          </div>

        </div>

        {/* BOTTOM CTA: bergabung lah bersama kami di imperiumcrypto.id fondasi awal langkahmu */}
        <div className="text-center mt-12 md:mt-16 relative z-20">
          <p className="text-sm sm:text-base md:text-lg text-neutral-400 font-medium">
            Bergabunglah bersama kami di{" "}
            <span className="text-[#d4af37] font-bold tracking-wide hover:underline cursor-pointer">
              imperiumcrypto.id
            </span>{" "}
            — fondasi awal langkahmu.
          </p>
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
