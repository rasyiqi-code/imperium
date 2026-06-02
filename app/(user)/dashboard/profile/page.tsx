'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Mail, Edit3, Save, X, LogOut, RefreshCw, Gem, Calendar } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

export default function ProfilePage() {
  const { showAlert, showConfirm } = useModal()
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [updating, setUpdating] = useState(false)
  
  const [profile, setProfile] = useState({
    id_user_auth: '',
    nama_member: '',
    email_member: '',
    nomor_wa: '',
    status_vip: 'Gratis',
    masa_aktif: null as string | null
  })

  const [tempProfile, setTempProfile] = useState({ ...profile })

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // 1. Fetch user metadata from profiles table
        const { data: profData } = await supabase
          .from('profiles')
          .select('full_name, whatsapp_number, plan')
          .eq('id', user.id)
          .maybeSingle() as any

        // 2. Fetch membership active status from data_member_vip
        const { data: vipData } = await supabase
          .from('data_member_vip')
          .select('status_aktif, tanggal_berakhir')
          .eq('id_user_auth', user.id)
          .maybeSingle() as any

        const isVip = profData?.plan === 'vip' || vipData?.status_aktif === 'aktif' || vipData?.status_aktif === 'vip'

        const dataProfile = {
          id_user_auth: user.id,
          nama_member: profData?.full_name || user.user_metadata?.full_name || 'Member Imperium',
          email_member: user.email || '',
          nomor_wa: profData?.whatsapp_number || user.user_metadata?.whatsapp_number || '',
          status_vip: isVip ? 'VIP MEMBER' : 'PAKET GRATIS',
          masa_aktif: vipData?.tanggal_berakhir || null
        }

        setProfile(dataProfile)
        setTempProfile(dataProfile)
      }
    } catch (err) {
      console.error("Fetch profile error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      // 3. Save name and whatsapp number in profiles table
      const { error } = await (supabase.from('profiles') as any)
        .update({
          full_name: tempProfile.nama_member,
          whatsapp_number: tempProfile.nomor_wa
        })
        .eq('id', profile.id_user_auth)

      if (!error) {
        setProfile({ ...tempProfile })
        setIsEditing(false)
        showAlert({
          title: 'Profil Diperbarui',
          message: 'Profil berhasil diperbarui!',
          type: 'success'
        })
      } else {
        showAlert({
          title: 'Gagal Memperbarui',
          message: error.message,
          type: 'danger'
        })
      }
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: `Gagal: ${err.message}`,
        type: 'danger'
      })
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-6 pb-32 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Profile */}
      <div className="text-center space-y-4">
        <div className="relative w-24 h-24 mx-auto">
          <div className="w-full h-full bg-neutral-900 border-2 border-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 shadow-xl shadow-yellow-500/5">
            <User size={40} />
          </div>
          <button 
            onClick={() => {
              if (isEditing) setTempProfile({ ...profile });
              setIsEditing(!isEditing);
            }}
            className={`absolute bottom-0 right-0 p-2.5 rounded-full border border-neutral-800 transition-all shadow-lg ${
              isEditing ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black hover:scale-110'
            }`}
          >
            {isEditing ? <X size={16} /> : <Edit3 size={16} />}
          </button>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white italic uppercase tracking-tight">Profil Saya</h1>
          <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">ID: {profile.id_user_auth.slice(0,8)}</p>
        </div>
      </div>

      {/* Subscription Card */}
      <div className={`p-6 rounded-3xl border flex items-center justify-between transition-all duration-500 ${
        profile.status_vip === 'VIP MEMBER' 
        ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.05)]' 
        : 'bg-neutral-900 border-neutral-800'
      }`}>
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            profile.status_vip === 'VIP MEMBER' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-neutral-800 text-neutral-500'
          }`}>
            <Gem size={24} />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 mb-0.5">Membership</div>
            <div className={`text-sm font-black italic tracking-tight ${profile.status_vip === 'VIP MEMBER' ? 'text-yellow-500' : 'text-white'}`}>
              {profile.status_vip}
            </div>
          </div>
        </div>
        {profile.status_vip === 'VIP MEMBER' && profile.masa_aktif && (
          <div className="text-right">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 italic flex items-center justify-end gap-1">
              <Calendar size={10} /> Expired
            </div>
            <div className="text-[11px] font-bold text-white mt-0.5">
              {new Date(profile.masa_aktif).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        )}
      </div>

      {/* Form Data */}
      <div className="bg-neutral-900/50 border border-neutral-800 p-6 rounded-3xl space-y-6">
        <div className="space-y-2 opacity-50">
          <label className="text-[10px] font-black text-neutral-500 uppercase tracking-widest ml-1 text-center block">E-Mail</label>
          <div className="flex items-center gap-4 p-4 bg-black/40 border border-neutral-800 rounded-2xl">
            <Mail size={18} className="text-neutral-600" />
            <span className="text-neutral-400 text-sm font-medium">{profile.email_member}</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 text-center block">Nama Member</label>
          {isEditing ? (
            <input 
              type="text"
              value={tempProfile.nama_member}
              onChange={(e) => setTempProfile({ ...tempProfile, nama_member: e.target.value })}
              className="w-full bg-neutral-800 border border-yellow-500/50 p-4 rounded-2xl text-white text-sm outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all text-center"
            />
          ) : (
            <div className="flex items-center justify-center gap-4 p-4 bg-black/20 border border-neutral-800 rounded-2xl">
              <span className="text-white text-sm font-bold tracking-wide uppercase">{profile.nama_member}</span>
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 text-center block">WhatsApp</label>
          {isEditing ? (
            <input 
              type="tel"
              value={tempProfile.nomor_wa}
              onChange={(e) => setTempProfile({ ...tempProfile, nomor_wa: e.target.value })}
              className="w-full bg-neutral-800 border border-yellow-500/50 p-4 rounded-2xl text-white text-sm outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all text-center"
            />
          ) : (
            <div className="flex items-center justify-center gap-4 p-4 bg-black/20 border border-neutral-800 rounded-2xl">
              <span className="text-white text-sm font-bold tracking-wide uppercase">{profile.nomor_wa}</span>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <button 
          onClick={handleUpdate}
          disabled={updating}
          className="w-full bg-yellow-500 text-black py-4 rounded-2xl font-black shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all uppercase text-sm tracking-widest"
        >
          {updating ? <RefreshCw className="animate-spin" size={20} /> : <><Save size={20} /> Simpan Perubahan</>}
        </button>
      ) : (
        <button 
          onClick={() => {
            showConfirm({
              title: 'Konfirmasi Logout',
              message: 'Apakah Anda yakin ingin keluar dari akun ini?',
              type: 'warning',
              confirmText: 'Ya, Keluar',
              cancelText: 'Batal',
              onConfirm: async () => {
                await supabase.auth.signOut();
                window.location.href = '/login';
              }
            })
          }}
          className="w-full bg-red-500/5 text-red-500 py-4 rounded-2xl font-bold border border-red-500/20 flex items-center justify-center gap-2 text-xs uppercase tracking-tighter hover:bg-red-500/10 transition-all active:scale-95"
        >
          <LogOut size={18} /> Logout Akun
        </button>
      )}
    </div>
  )
}