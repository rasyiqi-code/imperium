import { BarChart3, GraduationCap, ShieldCheck, Clock } from "lucide-react";

export default function CoreValues() {
  return (
    <section id="values" className="relative">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">

          {/* Heading */}
          {/* Heading - Rata tengah untuk konsistensi visual */}
          <h2 className="mb-6 text-balance text-3xl font-bold md:text-4xl text-center">
            Nilai yang Menjadi  
            <span className="block text-yellow-400 text-center">
              Fondasi Imperium Crypto
            </span>
          </h2>

          {/* Pengantar - Rata tengah dengan spasi baris yang lebih longgar */}
          <p className="mx-auto mb-16 max-w-2xl text-base md:text-lg leading-relaxed md:leading-loose text-neutral-400 text-center">
            Imperium Crypto dibangun di atas prinsip rasionalitas, transparansi,
            dan visi jangka panjang dalam memahami dinamika ekonomi digital.
            Nilai-nilai ini menjadi landasan dalam setiap konten, diskusi, dan
            pendekatan edukasi yang kami hadirkan.
          </p>

          {/* Values grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ValueItem
              icon={<BarChart3 />}
              title="Data over Drama"
              desc="Setiap analisis dan diskusi didasarkan pada data,
              konteks, dan logika — bukan sensasi atau euforia sesaat."
            />
            <ValueItem
              icon={<GraduationCap />}
              title="Education before Profit"
              desc="Pemahaman yang benar selalu didahulukan sebelum
              orientasi keuntungan jangka pendek."
            />
            <ValueItem
              icon={<ShieldCheck />}
              title="Transparency & Accountability"
              desc="Kami terbuka terhadap metodologi, asumsi, dan batasan
              dalam setiap analisis yang disampaikan."
            />
            <ValueItem
              icon={<Clock />}
              title="Long-term Vision"
              desc="Imperium Crypto berfokus pada pembangunan nilai
              berkelanjutan di era ekonomi digital."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ValueItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    // Box dengan efek glassmorphism premium, transisi scale, dan shadow emas pudar
    <div className="flex flex-col rounded-2xl border border-neutral-800 bg-[#0d0d0d]/40 backdrop-blur-md px-6 py-6 transition-all duration-300 hover:border-yellow-500/30 hover:shadow-[0_4px_30px_rgba(234,179,8,0.05)] hover:scale-[1.01]">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-left">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-400 text-left">{desc}</p>
    </div>
  );
}
