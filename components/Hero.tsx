import Image from "next/image";
import { BookOpen, Users, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative text-white overflow-hidden">
      {/* Ambient glow tambahan khusus untuk Hero */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-yellow-500/5 rounded-full blur-[150px] pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">

          {/* Logo dengan Sirkuit Radial Emas Redup di latar belakang */}
          <div className="mb-10 flex justify-center items-center relative">
            {/* Sirkuit Radial SVG melambangkan jaringan dan sinyal data */}
            <svg 
              className="absolute w-[220px] h-[220px] text-yellow-500/10 animate-rotate-slow pointer-events-none z-0" 
              viewBox="0 0 200 200" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="100" cy="100" r="82" stroke="currentColor" strokeWidth="0.8" strokeDasharray="6 8" />
              <circle cx="100" cy="100" r="62" stroke="currentColor" strokeWidth="0.6" strokeDasharray="30 15" />
              <circle cx="100" cy="100" r="46" stroke="currentColor" strokeWidth="0.4" />
              <path d="M 100 15 L 100 35 M 100 165 L 100 185 M 15 100 L 35 100 M 165 100 L 185 100" stroke="currentColor" strokeWidth="0.8" />
              <circle cx="100" cy="15" r="2.5" fill="currentColor" />
              <circle cx="100" cy="185" r="2.5" fill="currentColor" />
              <circle cx="15" cy="100" r="2.5" fill="currentColor" />
              <circle cx="165" cy="100" r="2.5" fill="currentColor" />
            </svg>

            {/* Logo utama aplikasi */}
            <div className="relative z-10 p-3 rounded-full bg-black/60 border border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
              <Image
                src="/logo.png"
                alt="Imperium Crypto"
                width={80}
                height={80}
                className="rounded-full object-contain"
                priority
              />
            </div>
          </div>

          {/* Badge Kapsul Bersinar */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-yellow-500/25 bg-yellow-500/5 px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.08)]">
            <ShieldCheck className="h-4 w-4" />
            Media Digital & Edukasi Crypto
          </div>

          {/* Headline - Gradasi Emas Metalik Premium & Tracking Tighter */}
          <h1 className="mb-6 text-balance text-center text-4xl font-black leading-tight tracking-tighter md:text-5xl lg:text-6xl text-white">
            Fondasi Pengetahuan  
            <span className="block text-center bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(234,179,8,0.15)]">
              di Era Uang Digital
            </span>
          </h1>

          {/* Deskripsi - Rata tengah agar simetris */}
          <p className="mx-auto text-center mb-12 max-w-3xl text-sm md:text-base leading-relaxed text-neutral-400">
            Imperium Crypto adalah platform media dan edukasi crypto yang berfokus pada literasi aset digital, analisis pasar berbasis data, serta
            pembentukan mindset finansial modern. Tanpa sensasi. Tanpa euforia.
          </p>

          {/* CTA - Tombol Premium Shimmer & Translucent Glassmorphism */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full max-w-md mx-auto sm:max-w-none">
            <a
              href="#pricing"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-8 py-4.5 font-bold uppercase tracking-wider text-black transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(234,179,8,0.35)] active:scale-[0.98]"
            >
              {/* Efek Kilau (Shimmer) saat tombol dirender */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              Lihat Paket Akses
            </a>

            <a
              href="#tentang"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md px-8 py-4.5 font-bold uppercase tracking-wider text-neutral-300 transition-all duration-300 hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-400 active:scale-[0.98]"
            >
              Tentang Imperium
            </a>
          </div>

          {/* Feature strip - Grid 3 kolom premium */}
          <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <Feature
              icon={<BookOpen />}
              title="Edukasi Rasional"
              desc="Pemahaman crypto berbasis data & riset"
            />
            <Feature
              icon={<Users />}
              title="Komunitas Berkualitas"
              desc="Diskusi terkurasi, bebas noise & hype"
            />
            <Feature
              icon={<ShieldCheck />}
              title="Etika & Transparansi"
              desc="Bukan nasihat investasi, dorong DYOR"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function Feature({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    // Box fitur menggunakan glassmorphic modern, border tipis, scale hover, dan glowing node
    <div className="group relative flex flex-col items-center rounded-3xl border border-white/[0.06] bg-[#0d0d0d]/40 backdrop-blur-md px-6 py-8 text-center transition-all duration-500 hover:border-yellow-500/30 hover:shadow-[0_8px_30px_rgba(234,179,8,0.04)] hover:scale-[1.02]">
      {/* Node Aktif Berdenyut Redup di Sudut Atas Kanan */}
      <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-yellow-500/40 group-hover:bg-yellow-500 group-hover:animate-pulse transition-colors" />
      
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/5 border border-yellow-500/15 text-yellow-400 group-hover:bg-yellow-500/10 group-hover:border-yellow-500/30 transition-all duration-300">
        {icon}
      </div>
      <h3 className="mb-2 font-bold text-white uppercase tracking-tight text-sm">{title}</h3>
      <p className="text-xs text-neutral-400 leading-relaxed">{desc}</p>
    </div>
  );
}
