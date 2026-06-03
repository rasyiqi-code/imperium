import React from "react";
import { BarChart3, AlertTriangle, TrendingUp, Brain } from "lucide-react";

export default function Problem() {
  return (
    <section id="problem" className="relative overflow-hidden bg-[#0b0b0b]">
      {/* Ambient glow tipis di latar belakang */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.015] rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          
          {/* JUDUL UTAMA: Gaya Editorial Majalah (Sans-serif Tipis + Serif Miring Emas) */}
          <h2 className="mb-6 text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-neutral-300 leading-tight tracking-tight">
            Dunia Crypto Terlalu Ramai.{" "}
            <span className="block mt-2 font-serif-editorial italic text-[#d4af37] font-normal drop-shadow-[0_2px_15px_rgba(212,175,55,0.1)]">
              Terlalu Banyak Noise.
            </span>
          </h2>

          {/* Deskripsi Pengantar */}
          <p className="mx-auto mb-16 max-w-3xl text-sm md:text-base leading-relaxed md:leading-loose text-neutral-450 text-center">
            Pasar crypto dipenuhi narasi sensasional, opini tanpa dasar data,
            dan euforia jangka pendek. Banyak orang masuk tanpa pemahaman,
            tanpa konteks, dan tanpa mindset finansial yang tepat — berujung
            pada keputusan impulsif dan ekspektasi yang keliru.
          </p>

          {/* GRID TABEL EDITORIAL (Solid Border, Sudut Tajam) */}
          <div className="grid grid-cols-1 md:grid-cols-2 border border-white/[0.08] bg-black/10 text-left rounded-none overflow-hidden">
            
            {/* Item 01 */}
            <div className="p-8 md:p-12 border-b md:border-r border-white/[0.08] flex flex-col justify-start relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#d4af37]/[0.003] group-hover:bg-[#d4af37]/[0.015] transition-colors duration-500 pointer-events-none" />
              <div className="absolute top-6 right-6 flex h-1.5 w-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/50"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/80"></span>
              </div>
              <span className="font-serif-editorial italic text-2xl text-[#d4af37]/50 mb-4 block select-none">01.</span>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="text-[#d4af37] flex items-center justify-center w-8 h-8 rounded bg-[#d4af37]/5 border border-[#d4af37]/15">
                  <AlertTriangle className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#d4af37]">Hype Mengalahkan Data</h3>
              </div>
              <p className="text-sm leading-relaxed md:leading-loose text-neutral-400">
                Keputusan investasi sering diambil hanya berdasarkan pengaruh emosi dan tren sesaat, bukan analisis fundamental maupun riset data yang objektif.
              </p>
            </div>

            {/* Item 02 */}
            <div className="p-8 md:p-12 border-b border-white/[0.08] flex flex-col justify-start relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#d4af37]/[0.003] group-hover:bg-[#d4af37]/[0.015] transition-colors duration-500 pointer-events-none" />
              <div className="absolute top-6 right-6 flex h-1.5 w-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/50"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/80"></span>
              </div>
              <span className="font-serif-editorial italic text-2xl text-[#d4af37]/50 mb-4 block select-none">02.</span>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="text-[#d4af37] flex items-center justify-center w-8 h-8 rounded bg-[#d4af37]/5 border border-[#d4af37]/15">
                  <TrendingUp className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#d4af37]">Janji Instan & Skema Cepat Kaya</h3>
              </div>
              <p className="text-sm leading-relaxed md:leading-loose text-neutral-400">
                Crypto sering kali disalahpahami sebagai jalan pintas meraih kekayaan secara instan, mengaburkan potensinya sebagai instrumen ekonomi digital jangka panjang.
              </p>
            </div>

            {/* Item 03 */}
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/[0.08] flex flex-col justify-start relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#d4af37]/[0.003] group-hover:bg-[#d4af37]/[0.015] transition-colors duration-500 pointer-events-none" />
              <div className="absolute top-6 right-6 flex h-1.5 w-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/50"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/80"></span>
              </div>
              <span className="font-serif-editorial italic text-2xl text-[#d4af37]/50 mb-4 block select-none">03.</span>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="text-[#d4af37] flex items-center justify-center w-8 h-8 rounded bg-[#d4af37]/5 border border-[#d4af37]/15">
                  <BarChart3 className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#d4af37]">Edukasi Bercampur Promosi</h3>
              </div>
              <p className="text-sm leading-relaxed md:leading-loose text-neutral-400">
                Sulit membedakan antara materi edukasi objektif dan agenda promosi terselubung. Informasi sering kali bias untuk kepentingan sepihak.
              </p>
            </div>

            {/* Item 04 */}
            <div className="p-8 md:p-12 flex flex-col justify-start relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#d4af37]/[0.003] group-hover:bg-[#d4af37]/[0.015] transition-colors duration-500 pointer-events-none" />
              <div className="absolute top-6 right-6 flex h-1.5 w-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/50"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/80"></span>
              </div>
              <span className="font-serif-editorial italic text-2xl text-[#d4af37]/50 mb-4 block select-none">04.</span>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="text-[#d4af37] flex items-center justify-center w-8 h-8 rounded bg-[#d4af37]/5 border border-[#d4af37]/15">
                  <Brain className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#d4af37]">Mindset Finansial yang Reaktif</h3>
              </div>
              <p className="text-sm leading-relaxed md:leading-loose text-neutral-400">
                Tanpa fondasi yang kuat mengenai konsep nilai uang, inflasi, dan manajemen risiko, keputusan finansial cenderung didasari oleh kepanikan pasar.
              </p>
            </div>

          </div>

        </div>

        {/* Pembatas Section Berbentuk Sirkuit Emas Redup (Circuit Divider) */}
        <div className="flex items-center justify-center gap-4 mt-24">
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-r from-transparent to-yellow-500/20" />
          {/* Node Sirkuit yang berdenyut */}
          <div className="w-2.5 h-2.5 rounded-full border border-yellow-500 bg-[#020202] shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" />
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-l from-transparent to-yellow-500/20" />
        </div>

      </div>
    </section>
  );
}
