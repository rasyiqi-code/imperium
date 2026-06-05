'use client'

import React, { useState } from 'react'
import { 
  X, RefreshCw, MessageSquare, PlusCircle, UserMinus, Trash2, Mail, User, Smartphone, Key 
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
  onUpdatePassword: (memberId: string, newPassword: string) => Promise<boolean>
}

export default function MemberDetailModal({
  member,
  onClose,
  isProcessing,
  onUpgrade,
  onDeactivate,
  onDelete,
  onUpdatePassword,
}: MemberDetailModalProps) {
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [isLocalProcessing, setIsLocalProcessing] = useState(false)

  const handlePasswordSubmit = async () => {
    if (newPassword.length < 6) return
    setIsLocalProcessing(true)
    const success = await onUpdatePassword(member.id, newPassword)
    setIsLocalProcessing(false)
    if (success) {
      setNewPassword('')
      setIsPasswordFormOpen(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-md md:max-w-xl bg-neutral-950/90 backdrop-blur-md border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 px-6 border-b border-neutral-900 bg-neutral-950/50">
          <h3 className="font-black tracking-wider text-white text-[10px] leading-none uppercase">Member Detail</h3>
          <button onClick={onClose} className="text-neutral-500 hover:text-white transition-all cursor-pointer">
            <X size={16} />
          </button>
        </div>
        
        <div className="p-5 space-y-4">
          {/* Grid Informasi Member (2 Kolom di Desktop) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
            <InfoItem label="Email Address" value={member.email} icon={<Mail size={13}/>} />
            <InfoItem label="Full Name" value={member.full_name || 'Anonymous'} icon={<User size={13}/>} />
            <InfoItem label="WhatsApp" value={member.whatsapp_number || 'NA'} icon={<Smartphone size={13}/>} />
            <InfoItem 
              label="Tanggal Daftar" 
              value={member.created_at ? new Date(member.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} 
              icon={<User size={13}/>} 
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
              icon={<MessageSquare size={13}/>} 
            />
            {member.id_discord_user && (
              <InfoItem label="ID User Discord" value={member.id_discord_user} icon={<MessageSquare size={13}/>} />
            )}
            
            {member.plan === 'vip' && (
              <>
                <div className="col-span-1 md:col-span-2 pt-1.5 border-t border-neutral-900/60" />
                <InfoItem label="Paket VIP Aktif" value={member.vip_plan_name || 'VIP'} icon={<PlusCircle size={13}/>} />
                <InfoItem 
                  label="Tanggal Mulai VIP" 
                  value={member.vip_activated_at ? new Date(member.vip_activated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} 
                  icon={<RefreshCw size={13}/>} 
                />
                <div className="col-span-1 md:col-span-2">
                  <InfoItem 
                    label="Tanggal Expired VIP" 
                    value={member.vip_expired_at ? new Date(member.vip_expired_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'} 
                    icon={<RefreshCw size={13}/>} 
                  />
                </div>
              </>
            )}
          </div>

          {isPasswordFormOpen && (
            <div className="p-3 rounded-2xl bg-neutral-900/25 border border-neutral-800/80 space-y-2 animate-in slide-in-from-top-2 duration-200">
              <p className="text-[9px] text-neutral-500 font-bold leading-relaxed">
                Masukkan password baru di bawah ini. Password akan diupdate langsung di Supabase Auth tanpa perlu konfirmasi email ke pengguna.
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Minimal 6 karakter..."
                  className="flex-1 bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 outline-none rounded-xl px-3 py-1.5 text-xs font-bold text-white placeholder-neutral-750 font-mono"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLocalProcessing}
                />
                <button
                  onClick={handlePasswordSubmit}
                  disabled={isLocalProcessing || newPassword.length < 6}
                  className="px-4 py-1.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-850 text-black disabled:text-neutral-500 text-[10px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 active:scale-95 cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  {isLocalProcessing ? <RefreshCw className="animate-spin" size={12} /> : 'Simpan'}
                </button>
              </div>
            </div>
          )}
          
          {/* Grid Tombol Aksi */}
          <div className="pt-3.5 border-t border-neutral-900">
            <div className="grid grid-cols-2 gap-2">
              
              {/* Tombol 1: Upgrade / Perpanjang VIP */}
              <button 
                onClick={() => onUpgrade(member)}
                disabled={isProcessing}
                className={`w-full py-2.2 rounded-xl font-black text-[10px] tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  member.plan === 'vip' 
                  ? 'bg-neutral-900 border border-neutral-800 hover:border-yellow-500/20 text-yellow-500 hover:bg-neutral-900' 
                  : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25'
                }`}
              >
                {isProcessing ? (
                  <RefreshCw className="animate-spin" size={13} />
                ) : member.plan === 'vip' ? (
                  <><PlusCircle size={13} /> Perpanjang VIP</>
                ) : (
                  'Upgrade ke VIP'
                )}
              </button>

              {/* Tombol 2: Set Kedaluwarsa */}
              {member.plan === 'vip' ? (
                <button 
                  onClick={() => onDeactivate(member)}
                  disabled={isProcessing}
                  className="w-full py-2.2 bg-red-500/5 text-red-400 border border-red-500/10 rounded-xl text-[10px] font-black hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isProcessing ? <RefreshCw className="animate-spin" size={13} /> : <UserMinus size={13} />} Set Kedaluwarsa
                </button>
              ) : (
                <button 
                  disabled
                  className="w-full py-2.2 bg-neutral-900/40 text-neutral-600 border border-neutral-800/40 rounded-xl text-[10px] font-black flex items-center justify-center gap-2 cursor-not-allowed opacity-40"
                >
                  <UserMinus size={13} /> Set Kedaluwarsa
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
                className="w-full py-2.2 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 rounded-xl text-center text-[10px] font-black tracking-wider text-neutral-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
              >
                <MessageSquare size={13} /> Chat WhatsApp
              </a>

              {/* Tombol 4: Hapus Akun */}
              <button 
                onClick={() => onDelete(member.id)} 
                disabled={isProcessing}
                className="w-full py-2.2 bg-red-500/5 text-red-400 border border-red-500/10 rounded-xl text-[10px] font-black hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 size={13} /> Hapus Akun
              </button>

              {/* Tombol 5: Setel Password Baru (Lebar Penuh) */}
              <button 
                onClick={() => setIsPasswordFormOpen(!isPasswordFormOpen)}
                className={`col-span-2 w-full py-2.2 rounded-xl font-black text-[10px] tracking-[0.15em] uppercase transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border ${
                  isPasswordFormOpen
                  ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/35 shadow-lg shadow-yellow-500/5'
                  : 'bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 text-neutral-400 hover:text-white'
                }`}
              >
                <Key size={13} /> {isPasswordFormOpen ? 'Tutup Set Password' : 'Setel Password Baru'}
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
    <div className="flex flex-col gap-0.5">
      <span className="text-[9px] font-bold text-neutral-500 tracking-wider flex items-center gap-1.5 leading-none">
        {icon} {label}
      </span>
      <span className="text-[11px] font-bold text-white truncate">{value}</span>
    </div>
  )
}
