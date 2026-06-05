'use client'

import React from 'react'
import { CheckSquare, Square } from 'lucide-react'
import { Profile } from './types'

interface MemberMobileCardListProps {
  members: Profile[]
  selectedIds: string[]
  onToggleSelectOne: (id: string) => void
  onSelectMember: (member: Profile) => void
}

export default function MemberMobileCardList({
  members,
  selectedIds,
  onToggleSelectOne,
  onSelectMember
}: MemberMobileCardListProps) {
  return (
    <div className="grid grid-cols-1 gap-3 md:hidden">
      {members.map(m => (
        <div 
          key={m.id} 
          className={`p-4 rounded-xl border transition-all duration-300 ${
            selectedIds.includes(m.id) 
              ? 'bg-yellow-500/5 border-yellow-500/30' 
              : 'bg-neutral-950/20 backdrop-blur-md border-neutral-800 hover:border-neutral-800'
          }`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="flex gap-3">
              <button 
                onClick={() => onToggleSelectOne(m.id)} 
                className={selectedIds.includes(m.id) ? 'text-yellow-500' : 'text-neutral-600'}
              >
                {selectedIds.includes(m.id) ? <CheckSquare size={20} /> : <Square size={20} />}
              </button>
              <div className="flex flex-col min-w-0 text-left">
                <span className="text-sm font-bold truncate max-w-40 text-white">
                  {m.full_name || 'Anonymous'}
                </span>
                <span className="text-[10px] text-neutral-500 font-bold tracking-wider truncate max-w-40 leading-none mt-1">
                  {m.email}
                </span>
                <div className="text-[9px] text-neutral-500 font-bold leading-none space-y-0.5 mt-2.5">
                  <p>
                    Daftar: <span className="text-neutral-300">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg tracking-widest border ${
                m.plan === 'vip' 
                  ? 'bg-yellow-500/5 text-yellow-500 border-yellow-500/15 uppercase' 
                  : 'bg-neutral-900/80 text-neutral-500 border-neutral-800 uppercase'
              }`}>
                {m.plan || 'FREE'}
              </span>
              {m.discord_status === 'joined' && (
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 border border-green-500/15 uppercase tracking-wider leading-none">
                  Discord: Join
                </span>
              )}
              {m.discord_status === 'kicked' && (
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-red-500/10 text-red-500 border border-red-500/15 uppercase tracking-wider leading-none">
                  Discord: Kick
                </span>
              )}
              {m.discord_status === 'not_joined' && (
                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/15 uppercase tracking-wider leading-none">
                  Discord: Hubung
                </span>
              )}
            </div>
          </div>
          <button 
            onClick={() => onSelectMember(m)} 
            className="w-full py-2.5 bg-neutral-900 border border-neutral-800 hover:border-neutral-700 rounded-xl text-xs font-bold transition-all duration-300 text-white cursor-pointer"
          >
            Detail Member
          </button>
        </div>
      ))}
    </div>
  )
}
