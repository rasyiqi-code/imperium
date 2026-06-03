import Image from "next/image";

export default function AboutImperium() {
  return (
    <section id="about" className="relative overflow-hidden">
      {/* Ambient glow redup di belakang gambar */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[350px] h-[350px] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none z-0" />
      
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="grid items-center gap-14 md:grid-cols-2">

          {/* Kiri: Gambar dengan penanganan responsif dan border bersinar emas tipis */}
          <div className="relative md:-ml-10 md:w-[110%] w-full ml-0 mb-8 md:mb-0 group">
            {/* Ambient shadow di belakang mockup */}
            <div className="absolute inset-0 bg-yellow-500/10 rounded-2xl blur-[30px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            
            <Image
              src="/chart.png"
              alt="Imperium Crypto Analysis"
              width={1000}
              height={650}
              className="relative z-10 w-full rounded-3xl object-cover shadow-[0_8px_30px_rgba(0,0,0,0.7)] border border-white/[0.06] group-hover:border-yellow-500/20 transition-colors duration-500"
            />
          </div>

          {/* Kanan: Konten Teks */}
          <div className="max-w-xl">
            {/* Judul Section dengan Gradien Emas Metalik & Glowing Node */}
            <h2 className="relative mb-6 text-balance text-3xl font-black md:text-4xl uppercase tracking-tight text-white">
              <span className="absolute -left-5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse hidden md:block" />
              Tentang  
              <span className="block bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_10px_rgba(234,179,8,0.15)]">
                Imperium Crypto
              </span>
            </h2>

            {/* Paragraf deskripsi dengan tinggi baris (line-height) yang longgar */}
            <div className="space-y-6 text-base md:text-lg leading-relaxed md:leading-loose text-neutral-400">
              <p>
                Imperium Crypto adalah platform media digital dan edukasi crypto
                yang berfokus pada pengembangan literasi aset digital, analisis
                pasar berbasis data, serta pembentukan mindset finansial modern
                di era ekonomi digital.
              </p>

              <p>
                Platform ini hadir untuk menjembatani kompleksitas dunia crypto
                dengan masyarakat yang ingin memahami aset digital secara
                rasional, objektif, dan bertanggung jawab dalam mengambil
                keputusan.
              </p>

              <p>
                Imperium Crypto beroperasi sebagai media dan platform edukasi,
                bukan sebagai lembaga keuangan dan bukan penyedia nasihat
                investasi personal. Seluruh konten bersifat informatif dan
                mendorong riset mandiri (DYOR).
              </p>
            </div>
          </div>

        </div>

        {/* Pembatas Section Berbentuk Sirkuit Emas Redup (Circuit Divider) */}
        <div className="flex items-center justify-center gap-4 mt-20 md:mt-28">
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-r from-transparent to-yellow-500/20" />
          {/* Node Sirkuit yang berdenyut */}
          <div className="w-2.5 h-2.5 rounded-full border border-yellow-500 bg-[#020202] shadow-[0_0_10px_rgba(234,179,8,0.5)] animate-pulse" />
          <div className="h-[1px] w-24 md:w-36 bg-gradient-to-l from-transparent to-yellow-500/20" />
        </div>

      </div>
    </section>
  );
}
