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
        const res = await fetch('/api/user/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getProfileData' })
        })
        const data = await res.json()

        if (res.ok) {
          const profData = data.profile
          const vipData = data.vipData
          const isVip = profData?.plan === 'vip' || vipData?.status_aktif === 'aktif' || vipData?.status_aktif === 'vip'

          const dataProfile = {
            id_user_auth: user.id,
            nama_member: profData?.full_name || user.user_metadata?.full_name || 'Member Imperium',
            email_member: user.email || '',
            nomor_wa: profData?.whatsapp_number || user.user_metadata?.whatsapp_number || '',
            status_vip: isVip ? 'VIP Member' : 'Paket Gratis',
            masa_aktif: vipData?.tanggal_berakhir || null
          }

          setProfile(dataProfile)
          setTempProfile(dataProfile)
        }
      }
    } catch (err) {
      console.error("Fetch profile error:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true
    const deferFetch = () => {
      if (isMounted) {
        fetchProfile()
      }
    }
    const timer = setTimeout(deferFetch, 0)
    return () => {
      isMounted = false
      clearTimeout(timer)
    }
  }, [fetchProfile])

  const handleUpdate = async () => {
    setUpdating(true)
    try {
      const res = await fetch('/api/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateProfile',
          fullName: tempProfile.nama_member,
          whatsappNumber: tempProfile.nomor_wa
        })
      })
      const data = await res.json()

      if (res.ok && data.success) {
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
          message: data.error || 'Gagal memperbarui profil',
          type: 'danger'
        })
      }
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Error',
        message: `Gagal: ${error.message}`,
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase">Profil Saya</h1>
        <p className="text-neutral-400 text-sm mt-1">Kelola informasi akun dan data membership kamu.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ===== Kolom Kiri: Info User & VIP Card ===== */}
        <div className="space-y-5">
          {/* Avatar Card */}
          <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 flex flex-col items-center gap-4 text-center">
            <div className="relative">
              <div className="w-24 h-24 bg-neutral-900 border-2 border-yellow-500/20 rounded-full flex items-center justify-center text-yellow-500 shadow-xl shadow-yellow-500/5">
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
              <p className="text-lg font-extrabold text-white">{profile.nama_member}</p>
              <p className="text-neutral-500 text-[10px] font-bold tracking-widest mt-0.5">ID: {profile.id_user_auth.slice(0,8)}</p>
            </div>
          </div>

          {/* VIP Card */}
          <div className={`p-5 rounded-2xl border flex items-center justify-between transition-all duration-500 ${
            profile.status_vip === 'VIP Member' 
            ? 'bg-yellow-500/10 border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.05)]' 
            : 'bg-neutral-900/50 border-neutral-800'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                profile.status_vip === 'VIP Member' ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-neutral-800 text-neutral-500'
              }`}>
                <Gem size={20} />
              </div>
              <div>
                <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase">Membership</div>
                <div className={`text-sm font-extrabold tracking-tight ${profile.status_vip === 'VIP Member' ? 'text-yellow-400' : 'text-white'}`}>
                  {profile.status_vip}
                </div>
              </div>
            </div>
            {profile.status_vip === 'VIP Member' && profile.masa_aktif && (
              <div className="text-right">
                <div className="text-[10px] font-bold tracking-widest text-neutral-500 uppercase flex items-center justify-end gap-1">
                  <Calendar size={10} /> Expired
                </div>
                <div className="text-[11px] font-bold text-white mt-0.5">
                  {new Date(profile.masa_aktif).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          {/* Tombol Logout */}
          {!isEditing && (
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
              className="w-full bg-red-500/5 text-red-500 py-3.5 rounded-2xl font-bold border border-red-500/20 flex items-center justify-center gap-2 text-xs tracking-widest hover:bg-red-500/10 transition-all active:scale-95"
            >
              <LogOut size={16} /> Logout Akun
            </button>
          )}
        </div>

        {/* ===== Kolom Kanan: Form Data (2/3 lebar) ===== */}
        <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 rounded-2xl p-6 space-y-5">
          {/* Email — read only */}
          <div className="space-y-1.5 opacity-50">
            <label className="text-[10px] font-bold text-neutral-500 tracking-widest uppercase">E-Mail</label>
            <div className="flex items-center gap-3 p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl">
              <Mail size={16} className="text-neutral-600 shrink-0" />
              <span className="text-neutral-400 text-sm font-medium">{profile.email_member}</span>
            </div>
          </div>

          {/* Nama Member */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">Nama Member</label>
            {isEditing ? (
              <input 
                type="text"
                value={tempProfile.nama_member}
                onChange={(e) => setTempProfile({ ...tempProfile, nama_member: e.target.value })}
                className="w-full bg-neutral-950 border border-yellow-500/50 p-3.5 rounded-xl text-white text-sm outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all"
              />
            ) : (
              <div className="flex items-center gap-3 p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                <span className="text-white text-sm font-bold">{profile.nama_member}</span>
              </div>
            )}
          </div>

          {/* WhatsApp */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">WhatsApp</label>
            {isEditing ? (
              <input 
                type="tel"
                value={tempProfile.nomor_wa}
                onChange={(e) => setTempProfile({ ...tempProfile, nomor_wa: e.target.value })}
                className="w-full bg-neutral-950 border border-yellow-500/50 p-3.5 rounded-xl text-white text-sm outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all"
              />
            ) : (
              <div className="flex items-center gap-3 p-3.5 bg-neutral-950/60 border border-neutral-800 rounded-xl">
                <span className="text-white text-sm font-bold">{profile.nomor_wa || '—'}</span>
              </div>
            )}
          </div>

          {/* Tombol Simpan (hanya muncul saat edit mode) */}
          {isEditing && (
            <button 
              onClick={handleUpdate}
              disabled={updating}
              className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black py-3.5 rounded-xl font-bold shadow-xl shadow-yellow-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all text-sm tracking-widest mt-2"
            >
              {updating ? <RefreshCw className="animate-spin" size={18} /> : <><Save size={18} /> Simpan Perubahan</>}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}