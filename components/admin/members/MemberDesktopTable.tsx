'use client'

import React from 'react'
import { CheckSquare, Square, Eye } from 'lucide-react'
import { Profile } from './types'

interface MemberDesktopTableProps {
  members: Profile[]
  selectedIds: string[]
  filteredMembersLength: number
  onToggleSelectAll: () => void
  onToggleSelectOne: (id: string) => void
  onSelectMember: (member: Profile) => void
}

export default function MemberDesktopTable({
  members,
  selectedIds,
  filteredMembersLength,
  onToggleSelectAll,
  onToggleSelectOne,
  onSelectMember
}: MemberDesktopTableProps) {
  return (
    <div className="hidden md:block bg-neutral-950/30 backdrop-blur-md border border-neutral-800/80 rounded-2xl overflow-hidden shadow-2xl">
      <table className="w-full text-left">
        <thead className="bg-neutral-950/50 text-[10px] font-black capitalize text-neutral-500 border-b border-neutral-900 tracking-wider">
          <tr>
            <th className="px-6 py-2.5 w-10 text-center">
              <button onClick={onToggleSelectAll} className="cursor-pointer">
                {selectedIds.length === filteredMembersLength ? (
                  <CheckSquare size={18} className="text-yellow-500" />
                ) : (
                  <Square size={18} className="text-neutral-600" />
                )}
              </button>
            </th>
            <th className="px-6 py-2.5">Info Member</th>
            <th className="px-6 py-2.5">Tanggal Daftar</th>
            <th className="px-6 py-2.5">Paket VIP</th>
            <th className="px-6 py-2.5">Mulai VIP</th>
            <th className="px-6 py-2.5">Expired VIP</th>
            <th className="px-6 py-2.5">Status Discord</th>
            <th className="px-6 py-2.5 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-900 text-xs font-medium">
          {members.map(m => (
            <tr key={m.id} className={selectedIds.includes(m.id) ? 'bg-yellow-500/5' : 'hover:bg-neutral-900/25 transition-all duration-300 group'}>
              <td className="px-6 py-2.5 text-center">
                <button onClick={() => onToggleSelectOne(m.id)} className="cursor-pointer">
                  {selectedIds.includes(m.id) ? (
                    <CheckSquare size={18} className="text-yellow-500" />
                  ) : (
                    <Square size={18} className="text-neutral-600" />
                  )}
                </button>
              </td>
              <td className="px-6 py-2.5 text-left">
                <div className="font-bold text-white group-hover:text-yellow-500 transition-colors font-sans">
                  {m.full_name || 'Anonymous'}
                </div>
                <div className="text-[10px] text-neutral-500 font-bold mt-0.5 tracking-tight">
                  {m.email}
                </div>
              </td>
              <td className="px-6 py-2.5 text-left text-[11px] font-bold text-neutral-400 tracking-wider">
                {m.created_at ? new Date(m.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
              </td>
              <td className="px-6 py-2.5 text-left">
                {m.plan === 'vip' ? (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-500 border border-yellow-500/15 uppercase tracking-widest self-start leading-none">
                    {m.vip_plan_name || 'VIP'}
                  </span>
                ) : (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800 uppercase tracking-widest self-start leading-none font-bold">
                    FREE
                  </span>
                )}
              </td>
              <td className="px-6 py-2.5 text-left text-[11px] font-bold text-neutral-400 tracking-wider">
                {m.plan === 'vip' && m.vip_activated_at ? new Date(m.vip_activated_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
              </td>
              <td className="px-6 py-2.5 text-left text-[11px] font-bold text-yellow-500/80 tracking-wider">
                {m.plan === 'vip' && m.vip_expired_at ? new Date(m.vip_expired_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
              </td>
              <td className="px-6 py-2.5 text-left">
                {m.discord_status === 'joined' && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/15 uppercase tracking-widest leading-none font-bold">
                    Bergabung
                  </span>
                )}
                {m.discord_status === 'kicked' && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/15 uppercase tracking-widest leading-none font-bold">
                    Di-kick / Keluar
                  </span>
                )}
                {m.discord_status === 'not_joined' && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15 uppercase tracking-widest leading-none font-bold">
                    Belum Join
                  </span>
                )}
                {m.discord_status === 'no_discord' && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-neutral-900 text-neutral-500 border border-neutral-800 uppercase tracking-widest leading-none font-bold">
                    Belum Hubung
                  </span>
                )}
                {m.discord_status === 'error' && (
                  <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/10 text-amber-500 border border-amber-500/15 uppercase tracking-widest leading-none font-bold">
                    Error API
                  </span>
                )}
              </td>
              <td className="px-6 py-2.5 text-right">
                <button
                  onClick={() => onSelectMember(m)}
                  className="p-2 bg-neutral-900/60 border border-neutral-800 hover:border-yellow-500/30 hover:text-yellow-500 rounded-xl transition-all duration-300 cursor-pointer"
                >
                  <Eye size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
