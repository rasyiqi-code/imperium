'use client'

import React from 'react'
import { 
  X, RefreshCw, MessageSquare, PlusCircle, UserMinus, Trash2, Mail, User, Smartphone 
} from 'lucide-react'

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  whatsapp_number: string | null;
  plan: string | null;
  plan_status: string | null;
  created_at: string;
  vip_activated_at?: string | null;
  vip_expired_at?: string | null;
  vip_plan_name?: string | null;
  id_discord_user?: string | null;
  vip_status_aktif?: string | null;
  discord_status?: string | null;
}

interface MemberDetailModalProps {
  member: Profile
  onClose: () => void
  isProcessing: boolean
  onUpgrade: (member: Profile) => void
  onDeactivate: (member: Profile) => void
  onDelete: (memberId: string) => void
}

export default function MemberDetailModal({
  member,
  onClose,
  isProcessing,
  onUpgrade,
  onDeactivate,
  onDelete,
}: MemberDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-md md:max-w-2xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-neutral-900 bg-neutral-950/50">
          <h3 className="font-black tracking-wider text-white text-xs leading-none uppercase">Member Detail</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-all cursor-pointer">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          {/* Grid Informasi Member (2 Kolom di Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <InfoItem label="Email Address" value={member.email} icon={<Mail size={14}/>} />
            <InfoItem label="Full Name" value={member.full_name || 'Anonymous'} icon={<User size={14}/>} />
            <InfoItem label="WhatsApp" value={member.whatsapp_number || 'NA'} icon={<Smartphone size={14}/>} />
            <InfoItem 
              label="Tanggal Daftar" 
              value={member.created_at ? new Date(member.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} 
              icon={<User size={14}/>} 
            />
            <InfoItem 
              label="Status Discord" 
              value={
                member.discord_status === 'joined' ? 'Bergabung ke Server VIP' :
                member.discord_status === 'kicked' ? 'Di-kick / Keluar dari Server VIP (Masa Aktif Habis)' :
                member.discord_status === 'not_joined' ? 'Menghubungkan Discord, Belum Join Server' :
                member.discord_status === 'no_discord' ? 'Belum Menghubungkan Discord' :
                member.discord_status === 'error' ? 'Gagal memuat status (API error)' : 'Tidak Diketahui'
              } 
              icon={<MessageSquare size={14}/>} 
            />
            {member.id_discord_user && (
              <InfoItem label="ID User Discord" value={member.id_discord_user} icon={<MessageSquare size={14}/>} />
            )}
            
            {member.plan === 'vip' && (
              <>
                <div className="col-span-1 md:col-span-2 pt-2 border-t border-neutral-900/60" />
                <InfoItem label="Paket VIP Aktif" value={member.vip_plan_name || 'VIP'} icon={<PlusCircle size={14}/>} />
                <InfoItem 
                  label="Tanggal Mulai VIP" 
                  value={member.vip_activated_at ? new Date(member.vip_activated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} 
                  icon={<RefreshCw size={14}/>} 
                />
                <div className="col-span-1 md:col-span-2">
                  <InfoItem 
                    label="Tanggal Expired VIP" 
                    value={member.vip_expired_at ? new Date(member.vip_expired_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} 
                    icon={<RefreshCw size={14}/>} 
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Grid Tombol Aksi */}
          <div className="pt-4 border-t border-neutral-900">
            <div className="grid grid-cols-2 gap-2">
              
              {/* Tombol 1: Upgrade / Perpanjang VIP */}
              <button 
                onClick={() => onUpgrade(member)}
                disabled={isProcessing}
                className={`w-full py-2.5 rounded-xl font-black text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  member.plan === 'vip' 
                  ? 'bg-neutral-900 border border-neutral-800 hover:border-yellow-500/20 text-yellow-500 hover:bg-neutral-900' 
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25'
                }`}
              >
                {isProcessing ? (
                  <RefreshCw className="animate-spin" size={14} />
                ) : member.plan === 'vip' ? (
                  <><PlusCircle size={14} /> Perpanjang VIP</>
                ) : (
                  'Upgrade ke VIP'
                )}
              </button>

              {/* Tombol 2: Nonaktifkan VIP */}
              {member.plan === 'vip' ? (
                <button 
                  onClick={() => onDeactivate(member)}
                  disabled={isProcessing}
                  className="w-full py-2.5 bg-red-500/5 text-red-400 border border-red-500/10 rounded-xl text-[10px] font-black hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={14} /> : <UserMinus size={14} />} Nonaktifkan VIP
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-2.5 bg-neutral-900/40 text-neutral-600 border border-neutral-800/40 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 cursor-not-allowed opacity-40"
                >
                  <UserMinus size={14} /> Nonaktifkan VIP
                </button>
              )}

              {/* Tombol 3: Chat WhatsApp */}
              <a 
                href={`https://wa.me/${
                  member.whatsapp_number
                    ? (member.whatsapp_number.replace(/[^0-9]/g, '').startsWith('0')
                      ? '62' + member.whatsapp_number.replace(/[^0-9]/g, '').slice(1)
                      : member.whatsapp_number.replace(/[^0-9]/g, ''))
                    : ''
                }`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-full py-2.5 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 rounded-xl text-center text-[10px] font-black tracking-wider text-neutral-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageSquare size={14} /> Chat WhatsApp
              </a>

              {/* Tombol 4: Hapus Akun */}
              <button 
                onClick={() => onDelete(member.id)} 
                disabled={isProcessing}
                className="w-full py-2.5 bg-red-500/5 text-red-400 border border-red-500/10 rounded-xl text-[10px] font-black hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={14} /> Hapus Akun
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoItem({ label, value, icon }: { label: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] font-bold text-neutral-500 tracking-wider flex items-center gap-1.5 leading-none">
        {icon} {label}
      </span>
      <span className="text-xs font-bold text-white truncate">{value}</span>
    </div>
  )
}
