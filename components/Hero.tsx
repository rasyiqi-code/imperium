import Image from "next/image";
import { BookOpen, Users, ShieldCheck } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative text-white">
      <div className="mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl text-center">

          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <Image
              src="/logo.png"
              alt="Imperium Crypto"
              width={88}
              height={88}
              className="drop-shadow-[0_0_18px_rgba(212,175,55,0.25)] rounded-full "
              priority
            />
          </div>

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/30 px-5 py-2 text-sm text-yellow-300 ">
            <ShieldCheck className="h-4 w-4" />
            Media Digital & Edukasi Crypto
          </div>

          {/* Headline - Diselaraskan rata tengah untuk konsistensi visual di mobile */}
          <h1 className="mb-6 text-balance text-center text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
            Fondasi Pengetahuan  
            <span className="block text-center bg-linear-to-r from-yellow-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
              di Era Uang Digital
            </span>
          </h1>

          {/* Deskripsi - Rata tengah agar simetris dengan judul */}
          <p className="mx-auto text-center mb-12 max-w-3xl text-lg leading-relaxed text-neutral-300 md:text-xl">
            Imperium Crypto adalah platform media dan edukasi crypto yang berfokus pada literasi aset digital, analisis pasar berbasis data, serta
            pembentukan mindset finansial modern. Tanpa sensasi. Tanpa euforia.
          </p>

          {/* CTA - Menjadi lebar penuh (w-full) dan rata tengah di mobile */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row w-full max-w-md mx-auto sm:max-w-none">
            <a
              href="#pricing"
              className="group relative inline-flex w-full sm:w-auto items-center justify-center overflow-hidden rounded-xl bg-linear-to-r from-yellow-400 to-amber-500 px-8 py-4 font-semibold text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_32px_rgba(212,175,55,0.35)]"
            >
              Lihat Paket Akses
              <span className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-white/10" />
            </a>

            <a
              href="#tentang"
              className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-neutral-700 px-8 py-4 font-semibold text-white transition hover:border-neutral-500 hover:bg-yellow-500 hover:text-black"
            >
              Tentang Imperium Crypto
            </a>
          </div>

          {/* Feature strip */}
          <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
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
    <div className="flex flex-col items-center rounded-xl border border-neutral-800 px-6 py-6 text-center transition hover:border-yellow-500/40">
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
        {icon}
      </div>
      <h3 className="mb-1 font-semibold">{title}</h3>
      <p className="text-sm text-neutral-400">{desc}</p>
    </div>
  );
}
