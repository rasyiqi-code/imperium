// components/DiscordCard.tsx
import { MemberVIP } from '@/lib/types'

interface Props {
  member: MemberVIP | null
}

export default function DiscordCard({ member }: Props) {
  const isAktif = member?.status_aktif === 'aktif' || member?.status_aktif === 'vip'

  return (
    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg flex flex-col justify-between">
      <div>
        <h2 className="text-sm font-medium tracking-wider mb-2 text-indigo-400">Akses Komunitas</h2>
        <p className="text-gray-300 text-sm mt-2 leading-relaxed">
          {isAktif 
            ? 'Akses penuh ke server Discord VIP sudah terbuka untukmu!' 
            : 'Selesaikan pembayaran dan tunggu aktivasi untuk mendapatkan link invite.'}
        </p>
      </div>
      
      <div className="mt-6">
        <a 
          href={isAktif ? `https://discord.gg/${member?.kode_invite_unik}` : '#'}
          target={isAktif ? "_blank" : "_self"}
          className={`block w-full text-center font-bold py-3 rounded-lg transition-all duration-200 ${
            isAktif 
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-900/20' 
            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAktif ? 'Join Server Discord' : 'Link Terkunci'}
        </a>
      </div>
    </div>
  )
}