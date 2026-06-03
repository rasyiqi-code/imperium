import { BarChart3, AlertTriangle, TrendingUp, Brain } from "lucide-react";

export default function Problem() {
  return (
    <section id="problem" className="relative overflow-hidden">
      {/* Ambient glow redup di belakang grid */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Heading - Gradasi Emas Metalik Premium */}
          <h2 className="mb-6 text-balance text-3xl font-black md:text-4xl lg:text-5xl text-center leading-tight tracking-tight">
            Dunia Crypto Terlalu Ramai.{" "}
            <span className="block mt-2 text-center bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(234,179,8,0.15)]">
              Terlalu Banyak Noise.
            </span>
          </h2>

          {/* Pengantar - Rata tengah dengan spasi baris yang longgar */}
          <p className="mx-auto mb-16 max-w-3xl text-sm md:text-base leading-relaxed md:leading-loose text-neutral-400 text-center">
            Pasar crypto dipenuhi narasi sensasional, opini tanpa dasar data,
            dan euforia jangka pendek. Banyak orang masuk tanpa pemahaman,
            tanpa konteks, dan tanpa mindset finansial yang tepat — berujung
            pada keputusan impulsif dan ekspektasi yang keliru.
          </p>

          {/* Problem points - Cyber Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
            <ProblemItem
              icon={<AlertTriangle className="h-5 w-5" />}
              title="Hype Mengalahkan Data"
              desc="Keputusan investasi sering diambil hanya berdasarkan pengaruh emosi dan tren sesaat, bukan analisis fundamental maupun riset data yang objektif."
            />
            <ProblemItem
              icon={<TrendingUp className="h-5 w-5" />}
              title="Janji Instan & Skema Cepat Kaya"
              desc="Crypto sering kali disalahpahami sebagai jalan pintas meraih kekayaan secara instan, mengaburkan potensinya sebagai instrumen ekonomi digital jangka panjang."
            />
            <ProblemItem
              icon={<BarChart3 className="h-5 w-5" />}
              title="Edukasi Bercampur Promosi"
              desc="Sulit membedakan antara materi edukasi objektif dan agenda promosi terselubung. Informasi sering kali bias untuk kepentingan sepihak."
            />
            <ProblemItem
              icon={<Brain className="h-5 w-5" />}
              title="Mindset Finansial yang Reaktif"
              desc="Tanpa fondasi yang kuat mengenai konsep nilai uang, inflasi, dan manajemen risiko, keputusan finansial cenderung didasari oleh kepanikan pasar."
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProblemItem({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="group relative flex flex-col rounded-3xl border border-white/[0.06] bg-[#0d0d0d]/40 backdrop-blur-md px-8 py-8 transition-all duration-300 hover:border-yellow-500/30 hover:bg-yellow-500/[0.01] hover:scale-[1.01] hover:shadow-[0_10px_30px_rgba(234,179,8,0.02)] overflow-hidden">
      {/* Node Emas Aktif Berdenyut di Sudut Kanan Atas */}
      <div className="absolute top-6 right-6 flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400/60 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500/80"></span>
      </div>

      {/* Konten Kartu */}
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-500/5 text-yellow-400 border border-yellow-500/15 shadow-[0_0_15px_rgba(234,179,8,0.08)] group-hover:border-yellow-500/30 group-hover:bg-yellow-500/10 transition-all duration-300">
        {icon}
      </div>
      <h3 className="mb-3 text-lg font-bold text-white transition-colors group-hover:text-yellow-400">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-400">{desc}</p>
    </div>
  );
}

