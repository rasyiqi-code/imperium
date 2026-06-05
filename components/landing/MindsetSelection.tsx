import React from "react";
import Image from "next/image";
import { CheckCircle2, AlertCircle, Sparkles } from "lucide-react";

export default function MindsetSelection() {
  return (
    <section id="mindset" className="relative overflow-hidden bg-[#0b0b0b]">
      {/* Ambient glow tipis di latar belakang */}
      <div className="hidden sm:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37]/[0.012] rounded-full blur-[140px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-0 md:pt-20 md:pb-0">
        <div className="mx-auto max-w-4xl text-center">
          {/* HEADLINE UTAMA: Gaya Editorial Majalah (Sans-serif Tipis + Serif Miring Emas) */}
          <span className="text-xs uppercase tracking-[0.25em] text-neutral-400 font-bold mb-3 block">
            KAMU ADA DI TIPE MANA?
          </span>
          <h2 className="mb-6 text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-neutral-300 leading-tight tracking-tight">
            Bergabunglah Bersama Kami di{" "}
            <span className="block mt-2 font-serif-editorial italic text-[#d4af37] font-normal drop-shadow-[0_2px_15px_rgba(212,175,55,0.15)]">
              imperiumcrypto.id, Fondasi Awal Langkahmu.
            </span>
          </h2>

          <p className="mx-auto mb-12 md:mb-16 max-w-2xl text-xs md:text-sm leading-relaxed md:leading-loose text-neutral-400">
            Setiap orang menghadapi persimpangan yang sama di dunia digital. Pilihan ada di tanganmu: tetap ragu dengan skeptisisme yang menahan, atau mengambil langkah berani membangun fondasi masa depan.
          </p>

          {/* GRID DUA KARTU KOMPARATIF */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 max-w-5xl mx-auto text-left">
            
            {/* KARTU 1: Yang Ragu & Skeptis (Skeptisisme Redup / Magenta Aksen) */}
            <div className="relative group rounded-2xl border border-white/[0.05] bg-black/35 overflow-hidden transition-all duration-500 hover:border-purple-500/25 hover:shadow-[0_0_30px_rgba(168,85,247,0.05)]">
              {/* Gambar Background Ragu */}
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-white/[0.05] bg-neutral-950">
                <Image
                  src="/path_skeptic.png"
                  alt="Tipe Ragu & Skeptis"
                  fill
                  className="object-cover opacity-70 filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                  sizes="(max-w-768px) 100vw, 50vw"
                  priority
                />
                {/* Overlay Gradasi Gelap */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                
                {/* Label Kecil Tipe */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/60 border border-white/10 backdrop-blur-sm flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
                  <span className="text-[10px] uppercase tracking-wider text-purple-300 font-semibold">Tipe Ragu</span>
                </div>
              </div>

              {/* Konten Teks */}
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-neutral-300 mb-3 group-hover:text-purple-300 transition-colors">
                    Orang yang Takut & Skeptis
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-400 font-light italic">
                    "Pengetahuan yang kamu pelajari tidak pernah membuatmu gagal."
                  </p>
                </div>
                {/* Penjelasan Pendek */}
                <p className="text-xs text-neutral-500 mt-4 leading-relaxed">
                  Seringkali keraguan menghentikan langkah belajar sebelum dimulai. Padahal ilmu yang didapat tidak akan pernah menjadi kerugian.
                </p>
              </div>
            </div>

            {/* KARTU 2: Yang Berani Bertindak (Pemberani Terang / Emas Aksen) */}
            <div className="relative group rounded-2xl border border-[#d4af37]/20 bg-black/35 overflow-hidden transition-all duration-500 hover:border-[#d4af37]/45 hover:shadow-[0_0_35px_rgba(212,175,55,0.08)]">
              {/* Badge Centang Biru / Emas di atas kartu */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500 text-black border border-cyan-300 font-extrabold text-[10px] tracking-wider uppercase shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Pilihan Tepat
                </div>
              </div>

              {/* Gambar Background Berani */}
              <div className="relative w-full aspect-[4/3] overflow-hidden border-b border-white/[0.05] bg-neutral-950">
                <Image
                  src="/path_action.png"
                  alt="Tipe Berani Mengambil Risiko"
                  fill
                  className="object-cover opacity-80 filter grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 pointer-events-none"
                  sizes="(max-w-768px) 100vw, 50vw"
                  priority
                />
                {/* Overlay Gradasi Gelap */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                {/* Label Kecil Tipe */}
                <div className="absolute top-4 left-4 px-3 py-1 rounded bg-black/60 border border-[#d4af37]/30 backdrop-blur-sm flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span className="text-[10px] uppercase tracking-wider text-[#d4af37] font-semibold">Tipe Pemberani</span>
                </div>
              </div>

              {/* Konten Teks */}
              <div className="p-6 md:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">
                    Orang yang Berani Mengambil Risiko
                  </h3>
                  <p className="text-sm leading-relaxed text-[#d4af37] font-semibold italic">
                    "Tapi keberanian mengambil risiko adalah fondasi awal menuju kesuksesan."
                  </p>
                </div>
                {/* Penjelasan Pendek */}
                <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
                  Langkah nyata untuk belajar dan menghadapi ketidakpastian adalah gerbang utama pembentukan aset finansial masa depan yang kokoh.
                </p>
              </div>
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
