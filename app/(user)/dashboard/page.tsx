'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MemberVIP } from '@/lib/types' 
import StatusCard from '@/components/dashboard/StatusCard'
import DiscordCard from '@/components/dashboard/DiscordCard'
import TradingSignals from '@/components/dashboard/TradingSignals'
import { Crown, AlertCircle, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Loader from '@/components/Loader'
import { StatusAktif } from '@/lib/types'

export default function UserDashboard() {
  const [member, setMember] = useState<MemberVIP | null>(null)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [freeInviteLink, setFreeInviteLink] = useState('#')
  const [vipInviteLink, setVipInviteLink] = useState('#')
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Pengecekan hasil otorisasi Discord dari URL query param
      const searchParams = new URLSearchParams(window.location.search)
      const discordStatus = searchParams.get('discord')
      const discordMessage = searchParams.get('message')
      if (discordStatus === 'success') {
        setToast({
          message: 'Koneksi Discord VIP Berhasil! Akun Anda telah terhubung dan otomatis masuk ke server.',
          type: 'success'
        })
        router.replace('/dashboard')
      } else if (discordStatus === 'error') {
        let msg = 'Gagal menghubungkan akun Discord.'
        if (discordMessage === 'auth_denied') msg = 'Otorisasi ditolak oleh pengguna.'
        else if (discordMessage === 'not_vip') msg = 'Keanggotaan VIP Anda tidak aktif.'
        else if (discordMessage === 'config_missing') msg = 'Konfigurasi Discord API di server belum lengkap.'
        else if (discordMessage === 'token_exchange_failed') msg = 'Gagal bertukar token otorisasi dengan Discord.'
        else if (discordMessage === 'guild_join_failed') msg = 'Gagal memasukkan akun Anda ke server Discord.'
        
        setToast({
          message: `Error: ${msg}`,
          type: 'error'
        })
        router.replace('/dashboard')
      }
      
      if (user) {
        // Sinkronkan status pembayaran dengan Midtrans
        try {
          await fetch('/api/checkout/check', { method: 'POST' })
        } catch (e) {
          console.error("Payment sync failed:", e)
        }

        try {
          const res = await fetch('/api/user/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getDashboardData' })
          })
          const data = await res.json()
          
          if (res.ok) {
            const p = data.profile
            const m = data.membership
            if (data.freeInviteLink) setFreeInviteLink(data.freeInviteLink)
            if (data.vipInviteLink) setVipInviteLink(data.vipInviteLink)

            const mergedData: MemberVIP = {
              id_user_auth: user.id,
              email_member: user.email || '',
              nama_member: p?.full_name || user.user_metadata?.full_name || 'Member',
              nomor_wa: m?.nomor_wa || user.user_metadata?.whatsapp_number || '',
              status_aktif: (m?.status_aktif || 'free') as StatusAktif, 
              nama_paket: m?.nama_paket || null,
              harga_bayar: m?.harga_bayar || 0,
              dibuat_pada: m?.created_at || new Date().toISOString(),
              tanggal_berakhir: m?.tanggal_berakhir || null,
              id_discord_user: m?.id_discord_user || null
            }
            setMember(mergedData)
          }
        } catch (err) {
          console.error("Gagal memuat data dashboard:", err)
        }
      }
      setLoading(false)
    }
    loadData()
  }, [router])

  if (loading) return <Loader label="Sinkronisasi Data..." />

  const isVip = member?.status_aktif === 'aktif' || member?.status_aktif === 'vip'
  const firstName = member?.nama_member?.split(' ')[0] || 'Member'

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-left">

      {/* ===== Welcome Header ===== */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-800 pb-4 mb-6 text-left">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white">
            Selamat Datang, <span className="text-yellow-500">{firstName}</span>!
          </h1>
          <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Pantau status membership dan akses komunitas eksklusif kamu.</p>
        </div>
        
        <button 
          onClick={() => router.push('/dashboard/upgrade')}
          className="group relative flex-shrink-0 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-black px-5 py-2.5 rounded-xl font-bold transition-all flex items-center gap-2 shadow-lg shadow-yellow-500/20 active:scale-95 text-xs tracking-wider hover:shadow-yellow-500/30 overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          <Crown size={16} /> 
          {isVip ? 'Perpanjang / Ubah Paket' : 'Upgrade ke VIP'}
        </button>
      </div>

      {/* ===== Status & Discord Cards ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
        <StatusCard member={member} />
        <DiscordCard member={member} freeInviteLink={freeInviteLink} vipInviteLink={vipInviteLink} />
      </div>

      {/* ===== Live Trading Signals ===== */}
      <TradingSignals 
        isVip={isVip} 
        onUpgradeClick={() => router.push('/dashboard/upgrade')} 
      />

      {/* ===== Info Box ===== */}
      <div className="flex gap-4 items-start bg-blue-500/5 border border-blue-500/15 p-5 rounded-2xl text-left">
        <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20 shrink-0 mt-0.5">
          <AlertCircle className="text-blue-400" size={16} />
        </div>
        <div>
          <h3 className="text-white font-extrabold text-xs mb-2 tracking-widest uppercase flex items-center gap-2">
            <ShieldCheck size={12} className="text-blue-400" />
            Informasi Penting
          </h3>
          <ul className="text-xs text-neutral-400 list-disc ml-4 space-y-1.5 leading-relaxed">
            <li>Link invite Discord bersifat <span className="text-white font-bold">Sekali Pakai</span> per akun.</li>
            <li>Status VIP diperbarui otomatis via Midtrans maksimal 1×24 jam.</li>
            <li>Dilarang membagikan sinyal Imperium ke publik atau komunitas lain.</li>
          </ul>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${
          toast.type === 'success'
            ? 'bg-green-500/10 border-green-500/20 text-green-400'
            : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          <AlertCircle size={18} />
          <p className="text-xs font-bold tracking-wide">{toast.message}</p>
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-80 font-black text-xs text-neutral-400">×</button>
        </div>
      )}

    </div>
  )
}