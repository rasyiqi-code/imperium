import { BarChart3, GraduationCap, ShieldCheck, Clock } from "lucide-react";

export default function CoreValues() {
  return (
    <section id="values" className="relative overflow-hidden">
      {/* Ambient glow redup di belakang grid */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-yellow-500/[0.03] rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Heading - Gradasi Emas Metalik Premium */}
          <h2 className="mb-6 text-balance text-3xl font-black md:text-4xl lg:text-5xl text-center leading-tight tracking-tight">
            Nilai yang Menjadi{" "}
            <span className="block mt-2 text-center bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-500 bg-clip-text text-transparent drop-shadow-[0_2px_15px_rgba(234,179,8,0.15)]">
              Fondasi Imperium Crypto
            </span>
          </h2>

          {/* Pengantar - Rata tengah dengan spasi baris yang longgar */}
          <p className="mx-auto mb-16 max-w-3xl text-sm md:text-base leading-relaxed md:leading-loose text-neutral-400 text-center">
            Imperium Crypto dibangun di atas prinsip rasionalitas, transparansi,
            dan visi jangka panjang dalam memahami dinamika ekonomi digital.
            Nilai-nilai ini menjadi landasan dalam setiap konten, diskusi, dan
            pendekatan edukasi yang kami hadirkan.
          </p>

          {/* Values grid - Cyber Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 text-left">
            <ValueItem
              icon={<BarChart3 className="h-5 w-5" />}
              title="Data over Drama"
              desc="Setiap analisis dan diskusi didasarkan pada data konkret, konteks historis, dan logika finansial yang logis — bukan pada sensasi atau euforia pasar sesaat."
            />
            <ValueItem
              icon={<GraduationCap className="h-5 w-5" />}
              title="Education before Profit"
              desc="Kami percaya pemahaman fundamental yang benar dan mendalam mengenai aset digital harus selalu didahulukan sebelum orientasi keuntungan jangka pendek."
            />
            <ValueItem
              icon={<ShieldCheck className="h-5 w-5" />}
              title="Transparency & Accountability"
              desc="Kami berkomitmen untuk selalu bersikap terbuka mengenai metodologi riset, asumsi analisis, serta batasan-batasan dalam setiap pandangan yang disampaikan."
            />
            <ValueItem
              icon={<Clock className="h-5 w-5" />}
              title="Long-term Vision"
              desc="Imperium Crypto berfokus pada pembangunan nilai berkelanjutan di era ekonomi digital, mendidik anggota untuk menyikapi siklus pasar secara bijaksana."
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

