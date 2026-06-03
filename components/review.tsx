'use client'

import React from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import Image from 'next/image';

import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const reviews = [
  {
    name: "Sultan Crypto",
    role: "Full-time Trader",
    image: "https://i.pravatar.cc/150?u=sultan",
    text: "Sinyal yang diberikan sangat presisi. Dalam satu bulan saya berhasil menutupi biaya membership berkali-kali lipat. Komunitasnya juga sangat suportif.",
    rating: 5
  },
  {
    name: "Anita Wijaya",
    role: "Analyst",
    image: "https://i.pravatar.cc/150?u=anita",
    text: "E-book dan edukasi premiumnya sangat mendalam. Tidak hanya dikasih sinyal, tapi kita juga diajarkan logika di balik setiap trade yang diambil.",
    rating: 5
  },
  {
    name: "Kevin Moontar",
    role: "Investor",
    image: "https://i.pravatar.cc/150?u=kevin",
    text: "Grup mentorship private-nya bener-bener gila. Direct mentorship dari founder bikin cara pandang saya terhadap market berubah total. Sangat direkomendasikan.",
    rating: 5
  },
  {
    name: "Budi Santoso",
    role: "Scalper",
    image: "https://i.pravatar.cc/150?u=budi",
    text: "Sangat membantu buat saya yang kerja kantoran tapi mau tetap dapet cuan sampingan dari crypto. Sinyalnya gampang diikuti bahkan buat pemula.",
    rating: 5
  },
  {
    name: "Dewi Lestari",
    role: "Swing Trader",
    image: "https://i.pravatar.cc/150?u=dewi",
    text: "Baru gabung seminggu sudah dapet setup yang risk-to-rewardnya masuk akal banget. Analisanya tajam dan tidak asal tebak koin pompa.",
    rating: 5
  },
  {
    name: "Fajar Sidik",
    role: "Day Trader",
    image: "https://i.pravatar.cc/150?u=fajar",
    text: "Platform paling rapi yang pernah saya ikuti. Dashboard sinyalnya memudahkan saya buat eksekusi cepat di exchange tanpa ketinggalan harga.",
    rating: 5
  }
];

export default function Reviews() {
  return (
    <section className="bg-[#0b0b0b] py-24 md:py-32 overflow-hidden relative">
      {/* Ambient glow tipis */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.01] rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* JUDUL UTAMA: Gaya Editorial Majalah (Sans-serif Tipis + Serif Miring Emas) */}
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-neutral-300 tracking-tight leading-tight uppercase">
            Review <span className="font-serif-editorial italic text-[#d4af37] font-normal">Anggota</span>
          </h2>
          <p className="text-[10px] font-bold text-neutral-500 tracking-[0.25em] uppercase">
            Hasil nyata dari komunitas eksklusif
          </p>
        </div>

        <div className="max-w-6xl mx-auto relative group">
          {/* Navigasi Arrows (Kotak Tajam / Editorial) */}
          <button className="swiper-prev absolute left-0 md:-left-14 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-none border border-white/[0.08] bg-black/60 text-neutral-450 hover:text-[#d4af37] hover:border-[#d4af37]/45 transition-all opacity-0 group-hover:opacity-100 hidden md:flex active:scale-95">
            <ChevronLeft size={20} />
          </button>
          <button className="swiper-next absolute right-0 md:-right-14 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-none border border-white/[0.08] bg-black/60 text-neutral-450 hover:text-[#d4af37] hover:border-[#d4af37]/45 transition-all opacity-0 group-hover:opacity-100 hidden md:flex active:scale-95">
            <ChevronRight size={20} />
          </button>

          <Swiper
            spaceBetween={28}
            slidesPerView={1}
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            pagination={{ clickable: true }}
            navigation={{
              nextEl: '.swiper-next',
              prevEl: '.swiper-prev',
            }}
            modules={[Autoplay, Pagination, Navigation]}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="pb-20!" 
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                {/* Kartu Testimoni: Sudut Tajam, Border Solid Tipis */}
                <div className="p-8 h-full rounded-none bg-black/25 border border-white/[0.08] flex flex-col justify-between transition-all hover:border-[#d4af37]/30 hover:bg-[#d4af37]/[0.005] text-left relative overflow-hidden group/card">
                  
                  {/* Efek Node Sirkuit Kecil Pojok Kanan Atas */}
                  <div className="absolute top-4 right-4 h-1.5 w-1.5 opacity-30 group-hover/card:opacity-90 transition-opacity">
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/80"></span>
                  </div>

                  <div className="space-y-6">
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={13} className="fill-[#d4af37] text-[#d4af37]" />
                      ))}
                    </div>
                    
                    <p className="text-sm font-medium text-neutral-350 leading-relaxed">
                      &quot;{review.text}&quot;
                    </p>
                  </div>

                  {/* Bagian Bawah Kartu: Info Member */}
                  <div className="mt-8 pt-6 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Avatar: Kotak Tajam (Editorial) */}
                      <div className="relative w-10 h-10 rounded-none overflow-hidden border border-white/[0.08] bg-neutral-900">
                        <Image 
                          src={review.image} 
                          alt={review.name}
                          fill
                          className="object-cover filter grayscale group-hover/card:grayscale-0 transition-all duration-500"
                        />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-xs font-bold text-white tracking-tight leading-none mb-1.5 uppercase">
                          {review.name}
                        </h4>
                        <span className="text-[10px] font-bold text-[#d4af37] tracking-wider leading-none uppercase">
                          {review.role}
                        </span>
                      </div>
                    </div>
                    <Quote size={18} className="text-neutral-800 opacity-40 group-hover/card:text-[#d4af37]/25 group-hover/card:opacity-100 transition-all" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Info Bergabung: Kotak Tajam (Editorial Style) */}
        <div className="mt-20 md:mt-24 text-center">
          <div className="inline-flex items-center gap-3.5 p-3 rounded-none bg-black/40 border border-white/[0.08] shadow-[0_5px_15px_rgba(0,0,0,0.2)]">
            <div className="flex -space-x-3">
              {reviews.slice(0, 5).map((rev, i) => (
                <div key={i} className="h-8 w-8 rounded-full border border-black overflow-hidden relative bg-neutral-850">
                  <Image src={rev.image} alt="avatar" fill className="object-cover" />
                </div>
              ))}
            </div>
            <p className="text-[10px] font-black text-white uppercase tracking-[0.15em] px-2 select-none">
              +100 Trader Telah Bergabung
            </p>
          </div>
        </div>

        {/* Pembatas Section Berbentuk Sirkuit Emas Redup (Circuit Divider) */}
        <div className="flex items-center justify-center gap-4 mt-28">
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-r from-transparent to-yellow-500/20" />
          {/* Node Sirkuit yang berdenyut */}
          <div className="w-2.5 h-2.5 rounded-full border border-yellow-500 bg-[#020202] shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" />
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-l from-transparent to-yellow-500/20" />
        </div>

      </div>

      <style jsx global>{`
        .swiper-pagination-bullet {
          width: 32px !important;
          height: 3px !important;
          border-radius: 0px !important;
          background: #262626 !important; 
          opacity: 1 !important;
          transition: all 0.3s ease;
        }
        .swiper-pagination-bullet-active {
          background: #d4af37 !important; 
          width: 48px !important;
        }
        .swiper-pagination {
          bottom: 0px !important;
          margin-top: 20px;
        }
      `}</style>
    </section>
  );
}