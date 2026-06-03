import { BarChart3, AlertTriangle, TrendingUp, Brain } from "lucide-react";

export default function Problem() {
  return (
    <section id="problem" className="relative">
      <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="mx-auto max-w-4xl text-center">

          {/* Heading */}
          {/* Heading - Rata tengah untuk keseimbangan tata letak visual */}
          <h2 className="mb-6 text-balance text-3xl font-bold md:text-4xl text-center">
            Dunia Crypto Terlalu Ramai.  
            <span className="block text-yellow-400 text-center">
              Terlalu Banyak Noise.
            </span>
          </h2>

          {/* Pengantar - Rata tengah dengan spasi baris yang longgar */}
          <p className="mx-auto mb-16 max-w-4xl text-base md:text-lg leading-relaxed md:leading-loose text-neutral-400 text-center">
            Pasar crypto dipenuhi narasi sensasional, opini tanpa dasar data,
            dan euforia jangka pendek. Banyak orang masuk tanpa pemahaman,
            tanpa konteks, dan tanpa mindset finansial yang tepat — berujung
            pada keputusan impulsif dan ekspektasi yang keliru.
          </p>

          {/* Problem points */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <ProblemItem
              icon={<AlertTriangle />}
              title="Hype Mengalahkan Data"
              desc="Keputusan sering diambil berdasarkan emosi dan tren,
              bukan analisis objektif."
            />
            <ProblemItem
              icon={<TrendingUp />}
              title="Janji Instan & Narasi Cepat Kaya"
              desc="Crypto dipromosikan sebagai jalan pintas, bukan
              instrumen ekonomi digital."
            />
            <ProblemItem
              icon={<BarChart3 />}
              title="Edukasi Tercampur Promosi"
              desc="Sulit membedakan mana pembelajaran, mana kepentingan."
            />
            <ProblemItem
              icon={<Brain />}
              title="Mindset Finansial yang Keliru"
              desc="Tanpa pemahaman uang, inflasi, dan risiko,
              keputusan menjadi reaktif."
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
    <div className="flex flex-col rounded-xl border border-neutral-800 px-6 py-6 transition hover:border-yellow-500/30">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/10 text-yellow-400">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-left">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-400 text-left">{desc}</p>
    </div>
  );
}
