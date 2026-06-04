import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/Footer';

export const revalidate = 0;

export const metadata = {
  title: 'Terms of Service',
  description: 'Syarat dan ketentuan layanan serta aturan keanggotaan komunitas Imperium Crypto yang wajib ditaati oleh seluruh member.',
  alternates: {
    canonical: '/terms-of-service',
  },
};

export default async function TermsOfServicePage() {
  const support = await prisma.support_config.findUnique({
    where: { id: 1 },
  });

  const content = support?.terms_content || 'Syarat dan Ketentuan keanggotaan Imperium Crypto yang harus dipatuhi oleh seluruh member.';

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
            Terms & Rules
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight font-sans uppercase">
            Terms of <span className="text-[#d4af37]">Service</span>
          </h1>
          <p className="text-neutral-500 text-xs md:text-sm font-semibold tracking-wider uppercase max-w-xl mx-auto">
            Ketentuan Layanan dan Aturan Penggunaan Komunitas
          </p>
        </div>

        {/* Konten Utama */}
        <div className="prose prose-invert max-w-none text-white text-sm md:text-base leading-relaxed space-y-6 font-medium tracking-wide">
          {content.split('\n').map((paragraph: string, index: number) => (
            <p key={index} className="whitespace-pre-line text-white">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Tombol Kembali / CTA */}
        <div className="text-center mt-12">
          <Link
            href="/"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.06] text-white px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
