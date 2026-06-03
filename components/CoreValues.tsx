import React from "react";
import { BarChart3, GraduationCap, ShieldCheck, Clock } from "lucide-react";

export default function CoreValues() {
  return (
    <section id="values" className="relative overflow-hidden bg-[#0b0b0b]">
      {/* Ambient glow tipis di latar belakang */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.015] rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          
          {/* JUDUL UTAMA: Gaya Editorial Majalah (Sans-serif Tipis + Serif Miring Emas) */}
          <h2 className="mb-6 text-balance text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-neutral-300 leading-tight tracking-tight">
            Nilai yang Menjadi{" "}
            <span className="block mt-2 font-serif-editorial italic text-[#d4af37] font-normal drop-shadow-[0_2px_15px_rgba(212,175,55,0.1)]">
              Fondasi Imperium Crypto
            </span>
          </h2>

          {/* Deskripsi Pengantar */}
          <p className="mx-auto mb-16 max-w-3xl text-sm md:text-base leading-relaxed md:leading-loose text-neutral-455 text-center">
            Imperium Crypto dibangun di atas prinsip rasionalitas, transparansi,
            dan visi jangka panjang dalam memahami dinamika ekonomi digital.
            Nilai-nilai ini menjadi landasan dalam setiap konten, diskusi, dan
            pendekatan edukasi yang kami hadirkan.
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
              <span className="font-serif-editorial italic text-2xl text-[#d4af37]/50 mb-4 block select-none">I.</span>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="text-[#d4af37] flex items-center justify-center w-8 h-8 rounded bg-[#d4af37]/5 border border-[#d4af37]/15">
                  <BarChart3 className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#d4af37]">Data over Drama</h3>
              </div>
              <p className="text-sm leading-relaxed md:leading-loose text-neutral-400">
                Setiap analisis dan diskusi didasarkan pada data konkret, konteks historis, dan logika finansial yang logis — bukan pada sensasi atau euforia pasar sesaat.
              </p>
            </div>

            {/* Item 02 */}
            <div className="p-8 md:p-12 border-b border-white/[0.08] flex flex-col justify-start relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#d4af37]/[0.003] group-hover:bg-[#d4af37]/[0.015] transition-colors duration-500 pointer-events-none" />
              <div className="absolute top-6 right-6 flex h-1.5 w-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/50"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/80"></span>
              </div>
              <span className="font-serif-editorial italic text-2xl text-[#d4af37]/50 mb-4 block select-none">II.</span>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="text-[#d4af37] flex items-center justify-center w-8 h-8 rounded bg-[#d4af37]/5 border border-[#d4af37]/15">
                  <GraduationCap className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#d4af37]">Education before Profit</h3>
              </div>
              <p className="text-sm leading-relaxed md:leading-loose text-neutral-400">
                Kami percaya pemahaman fundamental yang benar dan mendalam mengenai aset digital harus selalu didahulukan sebelum orientasi keuntungan jangka pendek.
              </p>
            </div>

            {/* Item 03 */}
            <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-white/[0.08] flex flex-col justify-start relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#d4af37]/[0.003] group-hover:bg-[#d4af37]/[0.015] transition-colors duration-500 pointer-events-none" />
              <div className="absolute top-6 right-6 flex h-1.5 w-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/50"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/80"></span>
              </div>
              <span className="font-serif-editorial italic text-2xl text-[#d4af37]/50 mb-4 block select-none">III.</span>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="text-[#d4af37] flex items-center justify-center w-8 h-8 rounded bg-[#d4af37]/5 border border-[#d4af37]/15">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#d4af37]">Transparency & Accountability</h3>
              </div>
              <p className="text-sm leading-relaxed md:leading-loose text-neutral-400">
                Kami berkomitmen untuk selalu bersikap terbuka mengenai metodologi riset, asumsi analisis, serta batasan-batasan dalam setiap pandangan yang disampaikan.
              </p>
            </div>

            {/* Item 04 */}
            <div className="p-8 md:p-12 flex flex-col justify-start relative group overflow-hidden">
              <div className="absolute inset-0 bg-[#d4af37]/[0.003] group-hover:bg-[#d4af37]/[0.015] transition-colors duration-500 pointer-events-none" />
              <div className="absolute top-6 right-6 flex h-1.5 w-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/50"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/80"></span>
              </div>
              <span className="font-serif-editorial italic text-2xl text-[#d4af37]/50 mb-4 block select-none">IV.</span>
              <div className="flex items-center gap-3.5 mb-4">
                <div className="text-[#d4af37] flex items-center justify-center w-8 h-8 rounded bg-[#d4af37]/5 border border-[#d4af37]/15">
                  <Clock className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-lg font-bold text-white transition-colors group-hover:text-[#d4af37]">Long-term Vision</h3>
              </div>
              <p className="text-sm leading-relaxed md:leading-loose text-neutral-400">
                Imperium Crypto berfokus pada pembangunan nilai berkelanjutan di era ekonomi digital, mendidik anggota untuk menyikapi siklus pasar secara bijaksana.
              </p>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
