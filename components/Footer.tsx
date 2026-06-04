import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#0b0b0b] text-white pt-16 pb-4 border-t border-white/[0.08]">
      {/* Sirkuit Radial Redup di Pojok Kanan Bawah */}
      <svg 
        className="absolute -right-20 -bottom-20 w-[300px] h-[300px] text-yellow-500/[0.012] animate-rotate-slow pointer-events-none z-0" 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 8" />
        <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="0.6" strokeDasharray="30 15" />
        <circle cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="0.4" />
      </svg>

      <div className="relative z-10 max-w-6xl mx-auto px-6 flex flex-col items-center text-center">
        
        {/* Logo Brand & Tagline Bergerak (News Ticker) */}
        <div className="space-y-4 mb-8 w-full">
          <h3 className="text-2xl font-black tracking-tighter uppercase">
            IMPERIUM<span className="text-[#d4af37]">CRYPTO</span>
          </h3>
          
          {/* Kontainer News Ticker dengan Efek Fade-Out Premium di Sisi Kiri & Kanan */}
          <div className="relative flex overflow-hidden border-y border-white/[0.05] py-2.5 bg-white/[0.01] w-full [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
            {/* Grup Teks 1 */}
            <div className="animate-ticker flex items-center gap-x-8 pr-8 shrink-0 text-neutral-500 text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em]">
              <span>Ruang eksklusif untuk Anda yang ingin menguasai pasar digital melalui analisis presisi dan komunitas elit</span>
              <span className="text-[#d4af37]">&bull;</span>
              <span>Akses analisis on-chain real-time, sinyal trading premium, & riset pasar crypto mendalam</span>
              <span className="text-[#d4af37]">&bull;</span>
              <span>Gabung komunitas elit trader crypto dan tingkatkan portofolio investasi Anda secara rasional</span>
              <span className="text-[#d4af37]">&bull;</span>
              <span>Update pasar harian & diskusi eksklusif bersama analis expert</span>
              <span className="text-[#d4af37]">&bull;</span>
              <span>Investasi cerdas dengan manajemen risiko ketat dan edukasi finansial tanpa henti</span>
              <span className="text-[#d4af37]">&bull;</span>
            </div>
            {/* Grup Teks 2 (Duplikasi untuk looping mulus tanpa celah kosong) */}
            <div className="animate-ticker flex items-center gap-x-8 pr-8 shrink-0 text-neutral-500 text-[9px] md:text-[10px] font-semibold uppercase tracking-[0.2em]" aria-hidden="true">
              <span>Ruang eksklusif untuk Anda yang ingin menguasai pasar digital melalui analisis presisi dan komunitas elit</span>
              <span className="text-[#d4af37]">&bull;</span>
              <span>Akses analisis on-chain real-time, sinyal trading premium, & riset pasar crypto mendalam</span>
              <span className="text-[#d4af37]">&bull;</span>
              <span>Gabung komunitas elit trader crypto dan tingkatkan portofolio investasi Anda secara rasional</span>
              <span className="text-[#d4af37]">&bull;</span>
              <span>Update pasar harian & diskusi eksklusif bersama analis expert</span>
              <span className="text-[#d4af37]">&bull;</span>
              <span>Investasi cerdas dengan manajemen risiko ketat dan edukasi finansial tanpa henti</span>
              <span className="text-[#d4af37]">&bull;</span>
            </div>
          </div>
        </div>

        {/* Menu Navigasi Horizontal */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10 pb-6 border-b border-white/[0.05] w-full max-w-2xl">
          <Link href="/about" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Tentang
          </Link>
          <Link href="/#pricing" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Gabung VIP
          </Link>
          <Link href="/bantuan" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Bantuan
          </Link>
          <Link href="/privacy-policy" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Terms of Service
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 max-w-4xl">
          <p className="text-[10px] sm:text-xs text-neutral-600 font-medium leading-relaxed tracking-wide">
            <span className="text-neutral-500 font-bold mr-2 uppercase tracking-widest text-[9px]">Disclaimer:</span> 
            Perdagangan aset crypto memiliki risiko tinggi. Seluruh informasi dalam komunitas ini bersifat edukasi dan referensi, bukan saran finansial mutlak. Akses digital tidak dapat di-refund setelah akses diberikan. Dengan bergabung, Anda menyatakan paham atas risiko investasi Anda sendiri.
          </p>
        </div>

        {/* Copyright & Developed By */}
        <div className="w-full pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-neutral-500 tracking-widest">
          <p>
            &copy; 2026 IMPERIUM CRYPTO. ALL RIGHTS RESERVED.
          </p>
          {/* Lisensi Crediblemark disembunyikan dari UI sesuai instruksi tetapi dipertahankan di kode sumber untuk validasi lisensi sistem */}
          <div className="hidden" aria-hidden="true">
            <a href="https://crediblemark.com">Crediblemark</a>
          </div>
        </div>

      </div>
    </footer>
  );
}