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
    <footer className="relative overflow-hidden bg-[#0b0b0b] text-white pt-20 pb-12 border-t border-white/[0.08]">
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

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        
        {/* Bagian Atas: Brand & Links */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-12 pb-16">
          <div className="max-w-sm space-y-4">
            <h3 className="text-2xl font-black tracking-tighter">
              IMPERIUM<span className="text-[#d4af37]">CRYPTO</span>
            </h3>
            <p className="text-neutral-500 text-sm font-medium tracking-wide leading-relaxed">
              Ruang eksklusif untuk Anda yang ingin menguasai pasar digital melalui analisis presisi dan komunitas elit.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-10 md:gap-20">
            {/* Navigasi */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-[#d4af37] uppercase tracking-widest">Navigasi</h4>
              <ul className="space-y-2.5">
                <li><a href="/about" className="text-neutral-400 hover:text-[#d4af37] text-sm font-medium transition-colors">Tentang</a></li>
                <li><a href="/#pricing" className="text-neutral-400 hover:text-[#d4af37] text-sm font-medium transition-colors">Gabung VIP</a></li>
                <li><a href="/bantuan" className="text-neutral-400 hover:text-[#d4af37] text-sm font-medium transition-colors">Bantuan</a></li>
              </ul>
            </div>

            {/* Legalitas */}
            <div className="space-y-4">
              <h4 className="text-xs font-black text-[#d4af37] uppercase tracking-widest">Legalitas</h4>
              <ul className="space-y-2.5">
                <li><a href="/privacy-policy" className="text-neutral-400 hover:text-[#d4af37] text-sm font-medium transition-colors">Privacy Policy</a></li>
                <li><a href="/terms-of-service" className="text-neutral-400 hover:text-[#d4af37] text-sm font-medium transition-colors">Terms of Service</a></li>
              </ul>
            </div>

            {/* Kontak */}
            <div className="space-y-4 col-span-2 md:col-span-1">
              <h4 className="text-xs font-black text-[#d4af37] uppercase tracking-widest">Kontak</h4>
              <ul className="space-y-2.5">
                <li>
                  <a href={`mailto:${email}`} className="text-neutral-400 hover:text-[#d4af37] text-sm font-medium transition-colors block break-all">
                    {email}
                  </a>
                </li>
                <li>
                  <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#d4af37] text-sm font-medium transition-colors block">
                    WhatsApp: +{whatsapp}
                  </a>
                </li>
                <li>
                  <a href={telegram} target="_blank" rel="noopener noreferrer" className="text-neutral-400 hover:text-[#d4af37] text-sm font-medium transition-colors block truncate">
                    Telegram Channel
                  </a>
                </li>
                <li className="text-neutral-500 text-xs font-medium tracking-wide">
                  Operasional: {operational}
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bagian Tengah: Disclaimer */}
        <div className="py-8 border-t border-white/[0.08]">
          <p className="text-xs text-neutral-600 font-medium leading-relaxed max-w-4xl tracking-wide">
            <span className="text-neutral-450 font-bold mr-2">Disclaimer:</span> 
            Perdagangan aset crypto memiliki risiko tinggi. Seluruh informasi dalam komunitas ini bersifat edukasi dan referensi, bukan saran finansial mutlak. Akses digital tidak dapat di-refund setelah akses diberikan. Dengan bergabung, Anda menyatakan paham atas risiko investasi Anda sendiri.
          </p>
        </div>

        {/* Bagian Bawah: Copyright */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs font-bold text-neutral-500 tracking-wider">
            &copy; 2026 IMPERIUM CRYPTO. ALL RIGHTS RESERVED.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-yellow-500/80 animate-pulse" />
            <p className="text-xs font-bold text-neutral-500 tracking-wider">
              Developed by <a href="https://dicoment.com" className="hover:text-[#d4af37] transition-colors">Dicoment Agency</a>
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
}