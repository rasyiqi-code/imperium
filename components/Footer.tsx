import React from 'react';

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-[#080808] text-white pt-24 pb-12 border-t border-white/[0.04]">
      {/* Sirkuit Radial Redup di Pojok Kanan Bawah */}
      <svg 
        className="absolute -right-20 -bottom-20 w-[300px] h-[300px] text-yellow-500/[0.015] animate-rotate-slow pointer-events-none z-0" 
        viewBox="0 0 200 200" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 8" />
        <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="0.6" strokeDasharray="30 15" />
        <circle cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="0.4" />
      </svg>

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        
        {/* Pembatas Sirkuit Mini Horizontal di Bagian Atas Footer */}
        <div className="w-full flex items-center justify-center mb-16 relative">
          <div className="absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"></div>
          <div className="relative z-10 px-6 bg-[#080808] flex items-center gap-3">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent to-yellow-500/20"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/30 animate-ping"></div>
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/70"></div>
            <div className="h-[1px] w-12 bg-gradient-to-l from-transparent to-yellow-500/20"></div>
          </div>
        </div>

        {/* Bagian Atas: Brand & Links */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-16">
          <div className="max-w-sm space-y-4">
            <h3 className="text-2xl font-black tracking-tighter">
              IMPERIUM<span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">CRYPTO</span>
            </h3>
            <p className="text-neutral-500 text-sm font-medium tracking-wide leading-relaxed">
              Ruang eksklusif untuk Anda yang ingin menguasai pasar digital melalui analisis presisi dan komunitas elit.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20">
            {/* Navigasi */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Navigasi</h4>
              <ul className="space-y-2">
                <li><a href="#about" className="text-neutral-400 hover:text-yellow-400 text-sm font-medium transition-colors">Tentang</a></li>
                <li><a href="#pricing" className="text-neutral-400 hover:text-yellow-400 text-sm font-medium transition-colors">Gabung VIP</a></li>
                <li><a href="#faq" className="text-neutral-400 hover:text-yellow-400 text-sm font-medium transition-colors">Bantuan</a></li>
              </ul>
            </div>

            {/* Legalitas */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Legalitas</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-400 hover:text-yellow-400 text-sm font-medium transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-neutral-400 hover:text-yellow-400 text-sm font-medium transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Kontak */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h4 className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Kontak</h4>
              <a href="mailto:support@imperiumcrypto.com" className="text-neutral-400 hover:text-yellow-400 text-sm font-medium transition-colors block">
                support@imperiumcrypto.com
              </a>
            </div>
          </div>
        </div>

        {/* Bagian Tengah: Disclaimer */}
        <div className="py-8 border-t border-white/[0.04]">
          <p className="text-xs text-neutral-600 font-medium leading-relaxed max-w-4xl tracking-wide">
            <span className="text-neutral-400 font-bold mr-2">Disclaimer:</span> 
            Perdagangan aset crypto memiliki risiko tinggi. Seluruh informasi dalam komunitas ini bersifat edukasi dan referensi, bukan saran finansial mutlak. Akses digital tidak dapat di-refund setelah akses diberikan. Dengan bergabung, Anda menyatakan paham atas risiko investasi Anda sendiri.
          </p>
        </div>

        {/* Bagian Bawah: Copyright */}
        <div className="pt-8 border-t border-white/[0.04] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-neutral-500 tracking-wider">
            &copy; 2026 IMPERIUM CRYPTO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
            <p className="text-xs font-bold text-neutral-500 tracking-wider">
              Developed by <a href="https://dicoment.com" className="hover:text-yellow-400 transition-colors">Dicoment Agency</a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}