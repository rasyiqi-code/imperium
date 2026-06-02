// components/StatusCard.tsx
import { MemberVIP } from '@/lib/types'

interface Props {
  member: MemberVIP | null
}

export default function StatusCard({ member }: Props) {
  const getStatusStyle = (status: string | undefined) => {
    switch (status) {
      case 'aktif':
      case 'vip':
        return 'bg-green-900/50 text-green-400 border-green-800'
      case 'menunggu':
        return 'bg-yellow-900/50 text-yellow-400 border-yellow-800'
      case 'free':
        return 'bg-neutral-800 text-neutral-400 border-neutral-700'
      default:
        return 'bg-red-900/50 text-red-400 border-red-800'
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg">
      <h2 className="text-sm font-medium uppercase tracking-wider mb-2 text-blue-400">Status Membership</h2>
      <div className="mt-2">
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${getStatusStyle(member?.status_aktif)}`}>
          {member?.status_aktif || 'Belum Terdaftar'}
        </span>
      </div>
      <p className="mt-6 text-2xl font-bold text-white">
        {member?.nama_paket || 'Paket Belum Dipilih'}
      </p>
      <p className="text-sm text-gray-500 mt-1 italic">
        Expired: {member?.tanggal_berakhir ? new Date(member.tanggal_berakhir).toLocaleDateString('id-ID') : 'N/A'}
      </p>
    </div>
  )
}