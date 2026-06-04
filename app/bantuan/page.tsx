import React from 'react';
import { prisma } from '@/lib/prisma';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/Footer';
import FAQ from '@/components/landing/FAQ';
import { Mail, MessageSquare, Send, Clock } from 'lucide-react';

export const revalidate = 0;

export const metadata = {
  title: 'Pusat Bantuan',
  description: 'Butuh bantuan? Temukan jawaban atas pertanyaan umum di FAQ atau hubungi kontak support kami via WhatsApp, Telegram, dan Email.',
  alternates: {
    canonical: '/bantuan',
  },
};

export default async function HelpPage() {
  const support = await prisma.support_config.findUnique({
    where: { id: 1 },
  });

  const whatsapp = support?.whatsapp_number || '62812345678';
  const telegram = support?.telegram_link || 'https://t.me/imperiumcrypto';
  const email = support?.support_email || 'support@imperiumcrypto.com';
  const operational = support?.operational_hours || '09:00 - 21:00 WIB';
  const helpContent = support?.help_content || 'Butuh bantuan? Silakan hubungi kontak support kami di bawah ini atau baca FAQ.';

  return (
    <main className="min-h-screen bg-[#060606] text-white flex flex-col justify-between overflow-x-hidden">
      <Navbar />

      {/* Hero Section Halaman Informasi */}
      <section className="relative pt-36 pb-12 px-6 max-w-5xl mx-auto w-full z-10 flex-grow">
        {/* Ornamen Latar Belakang */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.03] rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-yellow-500/20 bg-yellow-500/[0.03] text-yellow-500 text-[10px] font-black uppercase tracking-widest animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
            Support Center
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight font-sans uppercase">
            Pusat <span className="text-[#d4af37]">Bantuan</span>
          </h1>
          <p className="text-neutral-500 text-xs md:text-sm font-semibold tracking-wider uppercase max-w-xl mx-auto">
            Layanan Pelanggan dan Kontak Resmi Imperium Crypto
          </p>
        </div>

        {/* Pengantar Bantuan */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <p className="text-white text-sm md:text-base leading-relaxed font-medium tracking-wide">
            {helpContent}
          </p>
        </div>

        {/* Grid Kontak Support */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {/* WhatsApp Card */}
          <div className="relative bg-neutral-950/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:border-yellow-500/20 transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400 border border-green-500/15">
                <MessageSquare size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-white group-hover:text-yellow-500 transition-colors">WhatsApp</h3>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  Hubungi kami via chat WhatsApp untuk respon cepat terkait billing & akses.
                </p>
              </div>
            </div>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-2.5 text-center bg-white/5 hover:bg-green-500 hover:text-black border border-white/5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300"
            >
              Kirim Chat
            </a>
          </div>

          {/* Telegram Card */}
          <div className="relative bg-neutral-950/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:border-yellow-500/20 transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/15">
                <Send size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-white group-hover:text-yellow-500 transition-colors">Telegram Channel</h3>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  Gabung channel Telegram resmi untuk pembaruan sinyal dan edukasi harian.
                </p>
              </div>
            </div>
            <a
              href={telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 w-full py-2.5 text-center bg-white/5 hover:bg-blue-500 hover:text-black border border-white/5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300"
            >
              Gabung Channel
            </a>
          </div>

          {/* Email Card */}
          <div className="relative bg-neutral-950/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between shadow-lg hover:border-yellow-500/20 transition-all duration-300 group">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center text-[#d4af37] border border-yellow-500/15">
                <Mail size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-white group-hover:text-yellow-500 transition-colors">Email Support</h3>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  Kirim keluhan, proposal bisnis, atau kerja sama via email support kami.
                </p>
              </div>
            </div>
            <a
              href={`mailto:${email}`}
              className="mt-6 w-full py-2.5 text-center bg-white/5 hover:bg-[#d4af37] hover:text-black border border-white/5 rounded-xl text-[10px] font-black tracking-widest uppercase transition-all duration-300"
            >
              Kirim Email
            </a>
          </div>

          {/* Operational Hours Card */}
          <div className="relative bg-neutral-950/40 backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between shadow-lg border-dashed transition-all duration-300">
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 flex items-center justify-center text-neutral-400 border border-neutral-800">
                <Clock size={20} />
              </div>
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wide text-neutral-300">Jam Operasional</h3>
                <p className="text-xs text-neutral-500 font-medium mt-1 leading-relaxed">
                  Layanan bantuan chat direspon aktif pada jam operasional kerja.
                </p>
              </div>
            </div>
            <div className="mt-6 w-full py-2.5 text-center bg-neutral-900/60 border border-neutral-850 rounded-xl text-[10px] font-bold tracking-wider text-neutral-400 uppercase">
              {operational}
            </div>
          </div>
        </div>

        {/* Section FAQ internal di dalam bantuan */}
        <div className="border-t border-white/[0.06] pt-12">
          <FAQ />
        </div>
      </section>

      <Footer />
    </main>
  );
}
