import React from 'react';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const revalidate = 0;

export const metadata = {
  title: 'Tentang Kami - Imperium Crypto',
  description: 'Mengenal lebih dekat Imperium Crypto, visi, misi, dan latar belakang berdirinya komunitas edukasi crypto premium terbaik di Indonesia.',
};

export default async function AboutPage() {
  const support = await prisma.support_config.findUnique({
    where: { id: 1 },
  });

  const content = support?.about_content || 'Imperium Crypto adalah platform edukasi dan sinyal crypto premium terpercaya di Indonesia.';

  return (
    <main className="min-h-screen bg-[#060606] text-white flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      {/* Hero Section Halaman Informasi */}
      <section className="relative pt-36 pb-20 px-6 max-w-4xl mx-auto w-full z-10 flex-grow">
        {/* Ornamen Latar Belakang */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/[0.03] text-yellow-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Company Profile
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight font-sans uppercase">
            Tentang <span className="text-[#d4af37]">Kami</span>
          </h1>
          <p className="text-neutral-500 text-xs md:text-sm font-semibold tracking-wider uppercase max-w-xl mx-auto">
            Mengenal Visi, Misi, dan Fondasi Imperium Crypto
          </p>
        </div>

        {/* Konten Utama */}
        <div className="relative bg-neutral-950/40 backdrop-blur-xl border border-white/[0.06] rounded-3xl p-8 md:p-12 shadow-2xl space-y-6">
          {/* Efek Garis Emas Halus di Bagian Atas Card */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/60 to-transparent" />
          
          <div className="prose prose-invert max-w-none text-neutral-300 text-sm md:text-base leading-relaxed space-y-6 font-medium tracking-wide">
            {content.split('\n').map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Tombol Kembali / CTA */}
        <div className="text-center mt-12">
          <a
            href="/#pricing"
            className="inline-flex items-center gap-2 bg-[#d4af37] hover:bg-[#b8962e] text-black px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all shadow-[0_4px_15px_rgba(212,175,55,0.15)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.3)] active:scale-95"
          >
            Gabung VIP Komunitas
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
