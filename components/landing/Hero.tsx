import Image from "next/image";

export default function Hero() {
  return (
    <section className="relative text-white overflow-hidden bg-[#0b0b0b]">
      {/* Ambient glow tambahan khusus untuk Hero */}
      <div className="hidden sm:block absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-yellow-500/[0.03] rounded-full blur-[150px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-28 pb-12 min-h-[calc(100vh-80px)] flex flex-col justify-center">

        {/* KONTEN UTAMA: Heading, Deskripsi & CTA */}
        <div className="flex-grow flex flex-col justify-center items-center my-auto py-8 text-center">

          {/* Logo Watermark & Sirkuit Radial di belakang Headline */}
          <div className="relative mb-6 w-full flex items-center justify-center min-h-[180px] md:min-h-[220px]">
            {/* Sirkuit Radial SVG melambangkan jaringan dan sinyal data */}
            <div className="absolute inset-y-0 left-1/2 md:left-[30%] -translate-x-1/2 flex items-center justify-center pointer-events-none select-none z-0 opacity-40">
              <svg
                className="absolute w-[280px] h-[280px] md:w-[380px] md:h-[380px] text-yellow-500/25 animate-rotate-slow"
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

              {/* Logo utama aplikasi sebagai watermark */}
              <div className="relative p-4 rounded-full bg-black/60 border border-yellow-500/15 shadow-[0_0_50px_rgba(234,179,8,0.15)]">
                <Image
                  src="/logo.webp"
                  alt="Watermark Logo"
                  width={100}
                  height={100}
                  className="rounded-full object-contain opacity-45"
                  style={{ height: 'auto' }}
                  priority
                />
              </div>
            </div>

            {/* Headline - Tipografi Asimetris & Serif Kontras Premium */}
            <h1 className="relative z-10 max-w-4xl text-center leading-tight tracking-tight text-white text-3xl md:text-5xl lg:text-6xl font-black">
              <span className="block mb-2">
                Membangun <span className="font-serif-italic font-normal text-yellow-400/90 text-4xl md:text-6xl lg:text-7xl lowercase tracking-normal px-1">fondasi</span> Pengetahuan
              </span>
              <span className="flex items-center justify-center gap-4 text-balance">
                <span className="hidden md:inline-block h-[1px] w-14 bg-gradient-to-r from-transparent to-white/20"></span>
                di Era <span className="bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(234,179,8,0.15)] ml-1">Uang Digital</span>
              </span>
            </h1>
          </div>

          {/* Deskripsi - Rata tengah agar simetris */}
          <p className="mx-auto text-center mb-8 max-w-2xl text-xs md:text-sm leading-relaxed text-neutral-400">
            Platform media dan edukasi crypto yang berfokus pada literasi aset digital, analisis pasar berbasis data terkurasi, serta pembentukan mindset finansial jangka panjang. Tanpa noise. Bebas euforia.
          </p>

          {/* CTA Utama */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full max-w-md mx-auto sm:max-w-none mb-10">
            <a
              href="#pricing"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-black transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_rgba(234,179,8,0.3)] active:scale-[0.98]"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-shimmer" />
              Mulai Akses VIP
            </a>
            <a
              href="#about"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-md px-8 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-300 transition-all duration-300 hover:border-yellow-500/40 hover:bg-yellow-500/10 hover:text-yellow-400 active:scale-[0.98]"
            >
              Tentang Imperium
            </a>
          </div>

          {/* ELEMEN INTERAKTIF: 3D Grid Mesh Corong & Koin Melayang */}
          <div className="relative w-full max-w-2xl mx-auto h-[220px] md:h-[260px] flex items-center justify-center overflow-visible z-10 mt-2">

            {/* SVG Grid Mesh Corong Radial (Black Hole Data) */}
            <svg
              className="absolute w-[320px] sm:w-[480px] md:w-[580px] h-[200px] sm:h-[300px] md:h-[340px] text-yellow-500/[0.04] pointer-events-none z-0"
              viewBox="0 0 500 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <ellipse cx="250" cy="220" rx="240" ry="70" stroke="currentColor" strokeWidth="0.6" strokeDasharray="3 6" />
              <ellipse cx="250" cy="220" rx="190" ry="55" stroke="currentColor" strokeWidth="0.5" />
              <ellipse cx="250" cy="220" rx="140" ry="40" stroke="currentColor" strokeWidth="0.4" strokeDasharray="5 3" />
              <ellipse cx="250" cy="220" rx="90" ry="25" stroke="currentColor" strokeWidth="0.3" />
              <circle cx="250" cy="220" r="10" stroke="currentColor" strokeWidth="0.3" />
              <path d="M 10 220 C 100 220, 200 220, 250 220" stroke="currentColor" strokeWidth="0.4" />
              <path d="M 490 220 C 400 220, 300 220, 250 220" stroke="currentColor" strokeWidth="0.4" />
              <path d="M 250 30 C 250 120, 250 200, 250 220" stroke="currentColor" strokeWidth="0.4" />
              <path d="M 60 70 Q 150 160, 250 220" stroke="currentColor" strokeWidth="0.4" />
              <path d="M 440 70 Q 350 160, 250 220" stroke="currentColor" strokeWidth="0.4" />
              <path d="M 140 40 Q 195 140, 250 220" stroke="currentColor" strokeWidth="0.4" />
              <path d="M 360 40 Q 305 140, 250 220" stroke="currentColor" strokeWidth="0.4" />
            </svg>

            {/* Node Pusat Bersinar di tengah corong */}
            <div className="absolute top-[220px] left-1/2 -translate-x-1/2 -translate-y-1/2 flex h-3 w-3 z-10">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
            </div>

            {/* Koin Tengah Melayang: Bitcoin Emas */}
            <div className="absolute top-[80px] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
              <div className="animate-float">
                <div className="p-3 rounded-full bg-black/80 border border-yellow-500/20 shadow-[0_0_35px_rgba(234,179,8,0.2)] hover:border-yellow-500/40 transition-colors">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/5 text-yellow-400 font-extrabold text-2xl shadow-[inset_0_0_15px_rgba(234,179,8,0.1)]">
                    ₿
                  </div>
                </div>
              </div>
            </div>

            {/* Koin Kiri Melayang: Ethereum + Tooltip Sinyal */}
            <div className="absolute top-[135px] left-[2%] sm:left-[8%] md:left-[15%] z-10 animate-float-delayed flex items-center gap-2 sm:gap-3">
              <div className="p-2 rounded-full sm:p-2.5 bg-black/80 border border-white/[0.08] shadow-[0_0_20px_rgba(255,255,255,0.03)] shrink-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-neutral-900 text-neutral-300 font-bold text-xs sm:text-sm">
                  Ξ
                </div>
              </div>

              {/* Tooltip Info */}
              <div className="bg-black/85 border border-white/[0.08] rounded-xl sm:rounded-2xl p-2 sm:p-3.5 text-left w-28 sm:w-36 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                <div className="text-[8px] sm:text-[10px] font-bold text-neutral-400 leading-none">Ethereum Signal</div>
                <div className="text-[10px] sm:text-xs font-black text-emerald-400 mt-1 leading-none">+14.80% Profit</div>
                <div className="text-[7px] sm:text-[9px] text-neutral-500 mt-1 uppercase tracking-wider font-semibold leading-none">VIP Group Closed</div>
              </div>
            </div>

            {/* Koin Kanan Melayang: Solana + Tooltip Sinyal */}
            <div className="absolute top-[35px] right-[2%] sm:right-[8%] md:right-[15%] z-10 animate-float-slow flex items-center gap-2 sm:gap-3">

              {/* Tooltip Info */}
              <div className="bg-black/85 border border-white/[0.08] rounded-xl sm:rounded-2xl p-2 sm:p-3.5 text-left w-28 sm:w-36 backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.5)]">
                <div className="text-[8px] sm:text-[10px] font-bold text-neutral-400 leading-none">Bitcoin Analysis</div>
                <div className="text-[10px] sm:text-xs font-black text-yellow-400 mt-1 leading-none">VIP Member</div>
                <div className="text-[7px] sm:text-[9px] text-neutral-500 mt-1 uppercase tracking-wider font-semibold leading-none">Accumulation Zone</div>
              </div>

              <div className="p-2 rounded-full sm:p-2.5 bg-black/80 border border-yellow-500/15 shadow-[0_0_20px_rgba(234,179,8,0.1)] shrink-0">
                <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-yellow-500/5 text-yellow-500 font-bold text-xs sm:text-sm">
                  S
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}


