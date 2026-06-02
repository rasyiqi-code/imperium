// components/StatusCard.tsx
// Komponen kartu status membership yang menampilkan detail paket dan badge plan user
import { MemberVIP } from '@/lib/types'
import { Crown, Clock, ShieldCheck, ShieldOff } from 'lucide-react'

interface Props {
  member: MemberVIP | null
}

export default function StatusCard({ member }: Props) {
  const isVip = member?.status_aktif === 'aktif' || member?.status_aktif === 'vip'
  const isWaiting = member?.status_aktif === 'menunggu'

  // Tentukan label dan warna badge berdasarkan status
  const getStatusBadge = () => {
    switch (member?.status_aktif) {
      case 'aktif':
      case 'vip':
        return {
          label: 'VIP AKTIF',
          className: 'bg-green-500/15 text-green-400 border-green-500/30',
          dot: 'bg-green-400'
        }
      case 'menunggu':
        return {
          label: 'MENUNGGU AKTIVASI',
          className: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
          dot: 'bg-yellow-400 animate-pulse'
        }
      case 'free':
        return {
          label: 'FREE',
          className: 'bg-neutral-800 text-neutral-400 border-neutral-700',
          dot: 'bg-neutral-500'
        }
      default:
        return {
          label: 'TIDAK AKTIF',
          className: 'bg-red-500/10 text-red-400 border-red-500/20',
          dot: 'bg-red-400'
        }
    }
  }

  const badge = getStatusBadge()

  // Format tanggal expired
  const expiredText = member?.tanggal_berakhir
    ? new Date(member.tanggal_berakhir).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : null

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-6 flex flex-col gap-4 transition-all ${
      isVip
        ? 'bg-neutral-900/60 border-yellow-500/20 shadow-[0_0_30px_rgba(234,179,8,0.05)]'
        : 'bg-neutral-900/50 border-neutral-800'
    }`}>
      {/* Glow dekoratif saat VIP */}
      {isVip && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/10 rounded-full blur-2xl pointer-events-none" />
      )}

      {/* Header baris atas */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">Status Membership</p>
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${badge.className}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
      </div>

      {/* Nama Paket & Ikon */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl border ${
          isVip
            ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
            : isWaiting
              ? 'bg-yellow-500/5 border-yellow-500/10 text-yellow-600'
              : 'bg-neutral-800 border-neutral-700 text-neutral-500'
        }`}>
          {isVip ? <Crown size={20} /> : <ShieldOff size={20} />}
        </div>
        <div>
          <p className="text-xl font-extrabold text-white tracking-tight leading-tight">
            {member?.nama_paket || 'Belum Berlangganan'}
          </p>
          {isVip && (
            <p className="text-[10px] text-yellow-500/70 font-bold flex items-center gap-1 mt-0.5">
              <ShieldCheck size={11} /> Akses Premium Aktif
            </p>
          )}
        </div>
      </div>

      {/* Footer: expired atau status free */}
      <div className="pt-3 border-t border-neutral-800 flex items-center gap-2">
        <Clock size={13} className={isVip ? 'text-neutral-400' : 'text-neutral-600'} />
        <p className={`text-[11px] font-bold ${isVip ? 'text-neutral-400' : 'text-neutral-600'}`}>
          {expiredText
            ? `Aktif hingga: ${expiredText}`
            : isWaiting
              ? 'Menunggu konfirmasi dari admin...'
              : 'Belum ada paket aktif'}
        </p>
      </div>
    </div>
  )
}