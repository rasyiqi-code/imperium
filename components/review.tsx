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
    <section className="bg-[#0a0a0a] py-20 md:py-32 border-t border-neutral-900 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-3xl font-black md:text-5xl text-white tracking-tighter uppercase">
            Review <span className="text-yellow-500">Anggota</span>
          </h2>
          <p className="text-xs font-medium text-neutral-500 tracking-[0.3em] uppercase">
            Hasil nyata dari komunitas eksklusif
          </p>
        </div>

        <div className="max-w-6xl mx-auto relative group">
          {/* Navigasi Arrows */}
          <button className="swiper-prev absolute left-0 md:-left-12 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border border-neutral-800 bg-black/50 text-neutral-400 hover:text-white hover:border-yellow-500 transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronLeft size={24} />
          </button>
          <button className="swiper-next absolute right-0 md:-right-12 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full border border-neutral-800 bg-black/50 text-neutral-400 hover:text-white hover:border-yellow-500 transition-all opacity-0 group-hover:opacity-100 hidden md:flex">
            <ChevronRight size={24} />
          </button>

          <Swiper
            spaceBetween={24}
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
                <div className="p-8 h-full rounded-2xl bg-[#0d0d0d] border border-neutral-800 flex flex-col justify-between transition-all hover:border-neutral-700 text-left">
                  <div className="space-y-6">
                    <div className="flex gap-1">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} size={14} className="fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    
                    <p className="text-sm font-medium text-neutral-300 leading-relaxed">
                      &quot;{review.text}&quot;
                    </p>
                  </div>

                  <div className="mt-8 pt-6 border-t border-neutral-900 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border border-neutral-700 bg-neutral-800">
                        <Image 
                          src={review.image} 
                          alt={review.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col">
                        <h4 className="text-sm font-bold text-white tracking-tight leading-none mb-1 uppercase">
                          {review.name}
                        </h4>
                        <span className="text-xs font-medium text-yellow-500 tracking-wide leading-none uppercase">
                          {review.role}
                        </span>
                      </div>
                    </div>
                    <Quote size={20} className="text-neutral-800 opacity-50" />
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        {/* Info Bergabung */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-3 p-3 rounded-2xl bg-neutral-900/50 border border-neutral-800">
            <div className="flex -space-x-3">
              {reviews.slice(0, 5).map((rev, i) => (
                <div key={i} className="h-8 w-8 rounded-full border-2 border-[#0a0a0a] overflow-hidden relative bg-neutral-800">
                  <Image src={rev.image} alt="avatar" fill className="object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs font-bold text-white uppercase tracking-widest px-2">
              +100 Trader Telah Bergabung
            </p>
          </div>
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
          background: #eab308 !important; 
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