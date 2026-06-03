import React from 'react';
import { prisma } from '@/lib/prisma';

export default async function Footer() {
  // Ambil data konfigurasi support secara dinamis dari database
  const support = await prisma.support_config.findUnique({
    where: { id: 1 },
  });

  const whatsapp = support?.whatsapp_number || '62812345678';
  const telegram = support?.telegram_link || 'https://t.me/imperiumcrypto';
  const email = support?.support_email || 'support@imperiumcrypto.com';
  const operational = support?.operational_hours || '09:00 - 21:00 WIB';

  return (
    <footer className="relative overflow-hidden bg-[#0b0b0b] text-white pt-16 pb-12 border-t border-white/[0.08]">
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
        
        {/* Brand Logo & Tagline (Centered) */}
        <div className="space-y-3.5 mb-8">
          <h3 className="text-2xl font-black tracking-tighter uppercase">
            IMPERIUM<span className="text-[#d4af37]">CRYPTO</span>
          </h3>
          <p className="text-neutral-450 text-sm font-medium tracking-wide leading-relaxed max-w-xl mx-auto">
            Ruang eksklusif untuk Anda yang ingin menguasai pasar digital melalui analisis presisi dan komunitas elit.
          </p>
        </div>

        {/* Menu Navigasi Horizontal */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-6">
          <a href="/about" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Tentang
          </a>
          <a href="/#pricing" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Gabung VIP
          </a>
          <a href="/bantuan" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Bantuan
          </a>
          <a href="/privacy-policy" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Privacy Policy
          </a>
          <a href="/terms-of-service" className="text-neutral-400 hover:text-[#d4af37] text-xs font-bold uppercase tracking-wider transition-colors">
            Terms of Service
          </a>
        </div>

        {/* Kontak Support Horizontal */}
        <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-neutral-500 font-medium mb-10 pb-6 border-b border-white/[0.05] w-full max-w-2xl">
          <a href={`mailto:${email}`} className="hover:text-[#d4af37] transition-colors break-all">
            {email}
          </a>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#d4af37]/45" />
          <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] transition-colors">
            WhatsApp: +{whatsapp}
          </a>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#d4af37]/45" />
          <a href={telegram} target="_blank" rel="noopener noreferrer" className="hover:text-[#d4af37] transition-colors">
            Telegram
          </a>
          <span className="hidden sm:inline w-1 h-1 rounded-full bg-[#d4af37]/45" />
          <span className="text-neutral-500">
            Operasional: {operational}
          </span>
        </div>

        {/* Disclaimer */}
        <div className="mb-8 max-w-4xl">
          <p className="text-[10px] sm:text-xs text-neutral-600 font-medium leading-relaxed tracking-wide">
            <span className="text-neutral-500 font-bold mr-2 uppercase tracking-widest text-[9px]">Disclaimer:</span> 
            Perdagangan aset crypto memiliki risiko tinggi. Seluruh informasi dalam komunitas ini bersifat edukasi dan referensi, bukan saran finansial mutlak. Akses digital tidak dapat di-refund setelah akses diberikan. Dengan bergabung, Anda menyatakan paham atas risiko investasi Anda sendiri.
          </p>
        </div>

        {/* Copyright & Developed By */}
        <div className="w-full pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-bold text-neutral-500 tracking-widest">
          <p>
            &copy; 2026 IMPERIUM CRYPTO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-yellow-500/80 animate-pulse" />
            <p>
              Developed by <a href="https://dicoment.com" className="hover:text-[#d4af37] transition-colors">Dicoment Agency</a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}