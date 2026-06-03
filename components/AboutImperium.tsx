import Image from "next/image";

export default function AboutImperium() {
  return (
    <section id="about" className="relative overflow-hidden bg-[#0b0b0b]">
      {/* Ambient glow redup di latar belakang */}
      <div className="hidden sm:block absolute top-1/2 left-0 -translate-y-1/2 w-[400px] h-[400px] bg-yellow-500/[0.015] rounded-full blur-[150px] pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-12 pb-0 md:pt-16 md:pb-0">
        
        {/* HEADLINE RAKSASA: ABOUT IMPERIUM (O diganti logo dengan efek sunburst emas) */}
        <h2 className="font-serif-editorial tracking-tight text-white text-4xl sm:text-6xl md:text-7xl lg:text-8xl uppercase mb-16 flex items-center justify-center flex-wrap gap-x-4 md:gap-x-8 select-none">
          <span className="flex items-center gap-x-0 whitespace-nowrap">
            <span className="relative z-10">AB</span>
            <span className="inline-flex items-center justify-center relative w-[0.85em] h-[0.85em] text-[#d4af37] z-0 -mx-[0.12em]">
              {/* Sinar Sunburst Emas yang berputar lambat */}
              <svg className="w-full h-full fill-current animate-rotate-slow absolute inset-0" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 360) / 12;
                  return (
                    <line
                      key={i}
                      x1="50"
                      y1="14"
                      x2="50"
                      y2="27"
                      transform={`rotate(${angle} 50 50)`}
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      className="opacity-95"
                    />
                  );
                })}
              </svg>
              
              {/* Logo Transparan Asli di Tengah */}
              <div className="absolute w-[42%] h-[42%] rounded-full overflow-hidden flex items-center justify-center bg-black border border-[#d4af37]/35 shadow-[0_0_12px_rgba(212,175,55,0.25)]">
                <Image
                  src="/logo.png"
                  alt="Imperium Center Node"
                  width={80}
                  height={80}
                  className="w-[85%] h-[85%] object-contain"
                />
              </div>
            </span>
            <span className="relative z-10">UT</span>
          </span>
          <span>IMPERIUM</span>
        </h2>

        {/* EDITORIAL MAGAZINE GRID */}
        <div className="w-[calc(100%+3rem)] md:w-full border-y border-white/[0.08] bg-black/10 flex overflow-x-auto md:block snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden -mx-6 px-6 md:mx-0 md:px-0 gap-4 md:gap-0 py-4 md:py-0">
          
          {/* BARIS 1: Gambar Kiri (40%) | Teks Kanan (60%) */}
          <div className="flex flex-col md:grid md:grid-cols-12 items-stretch w-[85vw] md:w-full shrink-0 snap-center border border-white/[0.08] md:border-0 md:border-b border-white/[0.08] bg-neutral-900/30 md:bg-transparent rounded-2xl md:rounded-none overflow-hidden">
            {/* Gambar Kiri */}
            <div className="md:col-span-5 p-6 flex items-center justify-center border-b md:border-b-0 md:border-r border-white/[0.08] relative group overflow-hidden bg-black/20">
              <div className="absolute inset-0 bg-yellow-500/[0.01] group-hover:bg-yellow-500/[0.03] transition-colors duration-500 pointer-events-none" />
              <Image
                src="/chart.png"
                alt="Imperium Crypto Chart"
                width={500}
                height={330}
                className="w-full aspect-[3/2] rounded-none object-cover border border-white/[0.08] filter grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-[1.02]"
              />
            </div>
            {/* Teks Kanan */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-center text-left">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-extrabold mb-4">Visi & Platform Data-Driven</h3>
              <p className="text-sm md:text-base leading-relaxed md:leading-loose text-neutral-300">
                Imperium Crypto adalah platform media digital dan edukasi crypto yang berfokus pada pengembangan literasi aset digital, analisis pasar berbasis data terkurasi, serta pembentukan mindset finansial modern di era ekonomi digital. Kami berkomitmen untuk menyajikan pemahaman yang logis, bebas dari spekulasi impulsif.
              </p>
            </div>
          </div>

          {/* BARIS 2: Teks Kiri (60%) | Gambar Kanan (40%) */}
          <div className="flex flex-col md:grid md:grid-cols-12 items-stretch w-[85vw] md:w-full shrink-0 snap-center border border-white/[0.08] md:border-0 bg-neutral-900/30 md:bg-transparent rounded-2xl md:rounded-none overflow-hidden">
            {/* Teks Kiri */}
            <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-center text-left order-2 md:order-1">
              <h3 className="text-xs uppercase tracking-[0.2em] text-[#d4af37] font-extrabold mb-4">Rasionalitas & Tanggung Jawab</h3>
              <p className="text-sm md:text-base leading-relaxed md:leading-loose text-neutral-300">
                Kami percaya bahwa pemahaman yang rasional, objektif, and bertanggung jawab adalah kunci utama dalam mengambil keputusan finansial. Imperium Crypto beroperasi secara independen sebagai platform edukasi bebas kebisingan (noise), bukan penyedia nasihat investasi personal, guna mendorong riset mandiri (DYOR) yang mendalam.
              </p>
            </div>
            {/* Gambar Kanan */}
            <div className="md:col-span-5 p-6 flex items-center justify-center border-b md:border-b-0 md:border-l border-white/[0.08] relative group overflow-hidden bg-black/20 order-1 md:order-2">
              <div className="absolute inset-0 bg-yellow-500/[0.01] group-hover:bg-yellow-500/[0.03] transition-colors duration-500 pointer-events-none" />
              <Image
                src="/crypto_login.png"
                alt="Imperium Crypto Community"
                width={500}
                height={330}
                className="w-full aspect-[3/2] rounded-none object-cover border border-white/[0.08] filter grayscale group-hover:grayscale-0 transition-all duration-700 hover:scale-[1.02]"
              />
            </div>
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
    </section>
  );
}

