// components/DiscordCard.tsx
// Komponen kartu akses komunitas Discord yang menampilkan tombol join server VIP
import { MemberVIP } from '@/lib/types'
import { Lock, ExternalLink, Users } from 'lucide-react'

interface Props {
  member: MemberVIP | null
}

export default function DiscordCard({ member }: Props) {
  const isAktif = member?.status_aktif === 'aktif' || member?.status_aktif === 'vip'

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-neutral-900/50 border-neutral-800 p-6 flex flex-col gap-4">
      {/* Dekorasi glow sisi kanan atas */}
      {isAktif && (
        <div className="absolute -top-8 -right-8 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">Akses Komunitas</p>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
          isAktif
            ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
            : 'bg-neutral-800 text-neutral-500 border-neutral-700'
        }`}>
          <span className={`h-1.5 w-1.5 rounded-full ${isAktif ? 'bg-indigo-400' : 'bg-neutral-500'}`} />
          {isAktif ? 'TERBUKA' : 'TERKUNCI'}
        </span>
      </div>

      {/* Ikon Discord + Deskripsi */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl border ${
          isAktif
            ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
            : 'bg-neutral-800 border-neutral-700 text-neutral-600'
        }`}>
          {/* Ikon Discord SVG */}
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5" aria-hidden="true">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
          </svg>
        </div>
        <div>
          <p className="text-xl font-extrabold text-white tracking-tight leading-tight">Discord VIP</p>
          <p className="text-[11px] text-neutral-500 font-bold mt-0.5 flex items-center gap-1">
            <Users size={11} /> Server Eksklusif Trader Imperium
          </p>
        </div>
      </div>

      {/* Deskripsi */}
      <p className="text-xs text-neutral-400 leading-relaxed font-medium">
        {isAktif
          ? 'Selamat! Akses penuh ke server Discord VIP sudah terbuka. Klik tombol di bawah untuk bergabung.'
          : 'Upgrade ke paket VIP untuk mendapatkan akses eksklusif ke server Discord komunitas trader Imperium.'}
      </p>

      {/* Tombol */}
      <div className="mt-auto pt-2">
        {isAktif ? (
          <a
            href={`https://discord.gg/${member?.kode_invite_unik}`}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-white bg-indigo-600 hover:bg-indigo-500 transition-all hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] active:scale-[0.98]"
          >
            Masuk Server Discord
            <ExternalLink size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm text-neutral-600 bg-neutral-800 border border-neutral-700 cursor-not-allowed"
          >
            <Lock size={14} /> Link Terkunci
          </button>
        )}
      </div>
    </div>
  )
}