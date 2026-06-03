'use client'

import React, { useEffect, useState } from 'react';
import { ChevronDown, HelpCircle, RefreshCw } from 'lucide-react';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
}

export default function FAQ() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFaqs() {
      try {
        const res = await fetch('/api/faqs');
        const data = await res.json();
        if (res.ok && data.faqs) {
          setFaqs(data.faqs);
        }
      } catch (err) {
        console.error('Gagal memuat FAQ:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchFaqs();
  }, []);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  // Fallback cerdas jika data FAQ di database kosong
  const defaultFaqs: Omit<FAQItem, 'id'>[] = [
    {
      question: "Apa itu Imperium Crypto?",
      answer: "Imperium Crypto adalah platform media independen dan komunitas premium edukasi crypto yang menyediakan sinyal pasar akurat, riset mendalam berbasis data-driven, serta panduan lengkap untuk pemula hingga profesional.",
      sort_order: 1
    },
    {
      question: "Bagaimana cara bergabung ke grup VIP?",
      answer: "Anda dapat memilih paket membership berbayar di bagian Pricing, menyelesaikan pembayaran melalui sistem Midtrans yang aman, dan secara otomatis Anda akan mendapatkan akses ke grup eksklusif Discord VIP.",
      sort_order: 2
    },
    {
      question: "Apakah pemula bisa bergabung?",
      answer: "Sangat bisa. Kami menyediakan modul pembelajaran, e-book dasar, dan bimbingan komunitas yang ramah agar pemula dapat memahami alur analisis pasar secara logis tanpa spekulasi buta.",
      sort_order: 3
    }
  ];

  const faqsToRender = faqs.length > 0 ? faqs : defaultFaqs.map((faq, index) => ({
    id: `default-${index}`,
    ...faq
  }));

  if (loading) {
    return (
      <div className="py-16 flex justify-center items-center bg-[#0b0b0b]">
        <RefreshCw className="animate-spin text-[#d4af37]" size={28} />
      </div>
    );
  }

  return (
    <section id="faq" className="relative overflow-hidden pt-12 pb-0 md:pt-16 md:pb-0 bg-[#0b0b0b]">
      {/* Ambient glow tipis */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.01] rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-4xl px-6">
        
        {/* JUDUL UTAMA: Gaya Editorial Majalah (Sans-serif Tipis + Serif Miring Emas) */}
        <div className="text-center mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-neutral-300 tracking-tight leading-tight uppercase">
            FAQ / <span className="font-serif-editorial italic text-[#d4af37] font-normal">Pertanyaan Umum</span>
          </h2>
          <p className="text-[10px] font-bold text-neutral-500 tracking-[0.25em] uppercase">
            Semua hal yang perlu Anda ketahui tentang Imperium Crypto
          </p>
        </div>

        {/* ACCORDION GRID */}
        <div className="space-y-4 max-w-3xl mx-auto">
          {faqsToRender.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div 
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen 
                    ? 'border-[#d4af37]/35 bg-[#121212]/70 shadow-[0_10px_25px_rgba(212,175,55,0.02)]' 
                    : 'border-white/[0.06] bg-gradient-to-b from-[#121212]/30 to-[#0c0c0c]/30 hover:border-yellow-500/20 hover:bg-[#121212]/40'
                }`}
              >
                {/* Header Accordion */}
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left focus:outline-none cursor-pointer"
                >
                  <div className="flex items-start gap-4">
                    <HelpCircle size={18} className={`mt-0.5 shrink-0 transition-colors duration-300 ${isOpen ? 'text-[#d4af37]' : 'text-neutral-500'}`} />
                    <h3 className={`text-sm md:text-base font-bold tracking-tight uppercase leading-snug transition-colors duration-300 ${isOpen ? 'text-white' : 'text-neutral-300'}`}>
                      {faq.question}
                    </h3>
                  </div>
                  <ChevronDown 
                    size={16} 
                    className={`text-neutral-550 shrink-0 ml-4 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#d4af37]' : ''}`} 
                  />
                </button>

                {/* Body Accordion (Tinggi Dinamis dengan transisi CSS) */}
                <div 
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    isOpen ? 'max-h-[300px] border-t border-white/[0.04]' : 'max-h-0'
                  }`}
                >
                  <div className="p-5 md:p-6 pt-4 md:pt-4 text-xs md:text-sm leading-relaxed text-neutral-400">
                    {faq.answer}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pembatas Section Berbentuk Sirkuit Emas Redup (Circuit Divider) */}
        <div className="flex items-center justify-center gap-4 mt-12 md:mt-16">
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-r from-transparent to-yellow-500/20" />
          {/* Node Sirkuit yang berdenyut */}
          <div className="w-2.5 h-2.5 rounded-full border border-yellow-500 bg-[#020202] shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" />
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-l from-transparent to-yellow-500/20" />
        </div>

      </div>
    </section>
  );
}
