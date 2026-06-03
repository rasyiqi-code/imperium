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
    <section className="bg-[#0b0b0b] pt-12 pb-0 md:pt-16 md:pb-0 overflow-hidden relative">
      {/* Ambient glow tipis */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.01] rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6">
        
        {/* JUDUL UTAMA: Gaya Editorial Majalah (Sans-serif Tipis + Serif Miring Emas) */}
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light text-neutral-300 tracking-tight leading-tight uppercase">
            Review <span className="font-serif-editorial italic text-[#d4af37] font-normal">Anggota</span>
          </h2>
          <p className="text-[10px] font-bold text-neutral-500 tracking-[0.25em] uppercase">
            Hasil nyata dari komunitas eksklusif
          </p>
        </div>

        <div className="max-w-6xl mx-auto relative group">
          {/* Navigasi Arrows (Bundar / Premium Style) */}
          <button className="swiper-prev absolute left-0 md:-left-16 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-white/[0.08] bg-black/60 text-neutral-400 hover:text-black hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex active:scale-95 items-center justify-center cursor-pointer">
            <ChevronLeft size={16} />
          </button>
          <button className="swiper-next absolute right-0 md:-right-16 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full border border-white/[0.08] bg-black/60 text-neutral-400 hover:text-black hover:bg-[#d4af37] hover:border-[#d4af37] transition-all duration-300 opacity-0 group-hover:opacity-100 hidden md:flex active:scale-95 items-center justify-center cursor-pointer">
            <ChevronRight size={16} />
          </button>
 
          <Swiper
            spaceBetween={20}
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
            className="pb-12!" 
          >
            {reviews.map((review, index) => (
              <SwiperSlide key={index}>
                {/* Kartu Testimoni: Rounded-2xl, Luxury Glassmorphism, Elevate Hover & Shadow */}
                <div className="p-6 h-full rounded-2xl bg-gradient-to-b from-[#121212]/90 to-[#0c0c0c]/90 border border-white/[0.06] flex flex-col justify-between transition-all duration-500 hover:border-[#d4af37]/35 hover:bg-gradient-to-b hover:from-[#151515]/95 hover:to-[#0e0e0e]/95 hover:shadow-[0_15px_35px_rgba(212,175,55,0.04)] hover:-translate-y-1.5 text-left relative overflow-hidden group/card">
                  
                  {/* Pendaran Latar Belakang Tipis */}
                  <div className="absolute -top-24 -left-24 w-48 h-48 bg-yellow-500/[0.02] rounded-full blur-[40px] pointer-events-none group-hover/card:bg-yellow-500/[0.04] transition-colors duration-500" />

                  {/* Efek Node Sirkuit Kecil Pojok Kanan Atas */}
                  <div className="absolute top-4 right-4 h-1.5 w-1.5 opacity-30 group-hover/card:opacity-90 transition-opacity">
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-yellow-500/80"></span>
                  </div>
 
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-1">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} size={12} className="fill-[#d4af37] text-[#d4af37]" />
                        ))}
                      </div>
                      <Quote size={20} className="text-neutral-800 opacity-20 group-hover/card:text-[#d4af37]/15 group-hover/card:scale-110 transition-all duration-500" />
                    </div>
                    
                    <p className="font-serif-italic text-sm leading-relaxed text-neutral-200 font-normal">
                      &quot;{review.text}&quot;
                    </p>
                  </div>
 
                  {/* Bagian Bawah Kartu: Info Member */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Avatar: Bundar Premium */}
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/[0.08] p-0.5 bg-neutral-900 group-hover/card:border-[#d4af37]/35 transition-colors duration-500">
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                          <Image 
                            src={review.image} 
                            alt={review.name}
                            fill
                            className="object-cover filter grayscale group-hover/card:grayscale-0 transition-all duration-500"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-xs font-bold text-white tracking-tight leading-none mb-1.5 uppercase">
                          {review.name}
                        </h4>
                        <span className="text-[9px] font-black text-[#d4af37] tracking-widest leading-none uppercase">
                          {review.role}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
 
        {/* Info Bergabung: Rounded Premium Glass */}
        <div className="mt-8 md:mt-10 text-center">
          <div className="inline-flex items-center gap-3.5 p-2.5 px-4 rounded-full bg-[#121212]/60 backdrop-blur-md border border-white/[0.06] shadow-[0_10px_25px_rgba(0,0,0,0.3)]">
            <div className="flex -space-x-2.5">
              {reviews.slice(0, 5).map((rev, i) => (
                <div key={i} className="h-7 w-7 rounded-full border border-black overflow-hidden relative bg-neutral-850">
                  <Image src={rev.image} alt="avatar" fill className="object-cover" />
                </div>
              ))}
            </div>
            <p className="text-[9px] font-black text-white uppercase tracking-[0.15em] px-1.5 select-none">
              +100 Trader Telah Bergabung
            </p>
          </div>
        </div>
 
        {/* Pembatas Section Berbentuk Sirkuit Emas Redup (Circuit Divider) */}
        <div className="flex items-center justify-center gap-4 mt-12 md:mt-16">
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