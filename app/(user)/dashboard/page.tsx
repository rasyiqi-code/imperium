'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MemberVIP } from '@/lib/types' 
import StatusCard from '@/components/StatusCard'
import DiscordCard from '@/components/DiscordCard'
import { Crown, Lock, TrendingUp, AlertCircle, RefreshCw, Zap, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

// Samakan dengan interface di lib/types.ts agar tidak bentrok
import { StatusAktif } from '@/lib/types'


export default function UserDashboard() {
  const [member, setMember] = useState<MemberVIP | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      
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

            const mergedData: MemberVIP = {
              id_user_auth: user.id,
              email_member: user.email || '',
              nama_member: p?.full_name || user.user_metadata?.full_name || 'Member',
              nomor_wa: m?.nomor_wa || user.user_metadata?.whatsapp_number || '',
              status_aktif: (m?.status_aktif || 'free') as StatusAktif, 
              nama_paket: m?.nama_paket || null,
              harga_bayar: m?.harga_bayar || 0,
              dibuat_pada: m?.created_at || new Date().toISOString(),
              tanggal_berakhir: m?.tanggal_berakhir || null
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
  }, [])

  if (loading) return (
    <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <RefreshCw className="animate-spin text-yellow-500" size={28} />
      <div className="text-neutral-500 text-xs font-bold tracking-widest text-center uppercase">Sinkronisasi Data...</div>
    </div>
  )

  const isVip = member?.status_aktif === 'aktif' || member?.status_aktif === 'vip'
  const firstName = member?.nama_member?.split(' ')[0] || 'Member'

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 text-left">

      {/* ===== Welcome Header ===== */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-neutral-800 pb-4 mb-6">
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
        <DiscordCard member={member} />
      </div>

      {/* ===== Live Trading Signals ===== */}
      <div className="relative overflow-hidden bg-neutral-900/50 border border-neutral-800 rounded-2xl">
        {/* Overlay kunci untuk non-VIP */}
        {!isVip && (
          <div className="absolute inset-0 z-10 backdrop-blur-md bg-black/70 flex flex-col items-center justify-center text-center p-6 rounded-2xl">
            <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-2xl mb-4 shadow-2xl">
              <Lock className="text-yellow-500" size={28} />
            </div>
            <h3 className="text-base font-extrabold text-white mb-2 uppercase tracking-tight">Konten VIP Terkunci</h3>
            <p className="text-neutral-500 text-xs max-w-xs mb-5 leading-relaxed">
              Upgrade ke paket VIP Imperium untuk akses sinyal trading harian dengan akurasi tinggi.
            </p>
            <button 
              onClick={() => router.push('/dashboard/upgrade')}
              className="bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-6 py-2.5 rounded-xl font-bold hover:from-yellow-300 hover:to-amber-400 transition-all shadow-lg active:scale-95 text-xs tracking-wider"
            >
              Buka Akses VIP Sekarang
            </button>
          </div>
        )}

        {/* Header section signals */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-xl text-green-400 border border-green-500/20">
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white tracking-tight uppercase">Live Trading Signals</h3>
              <p className="text-[10px] text-neutral-500 font-bold">Update real-time setiap hari</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-500/10 border border-green-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Live</span>
          </div>
        </div>

        {/* Daftar sinyal */}
        <div className="p-6 pt-4 space-y-3">
          {[
            { pair: 'BTC / USDT', signal: 'HIDDEN_SIGNAL', icon: '₿' },
            { pair: 'ETH / USDT', signal: 'HIDDEN_SIGNAL', icon: 'Ξ' },
            { pair: 'SOL / USDT', signal: 'HIDDEN_SIGNAL', icon: '◎' },
          ].map((item) => (
            <div key={item.pair} className="flex items-center justify-between px-5 py-4 bg-neutral-950/60 border border-neutral-800 rounded-xl group hover:border-neutral-700 transition-all">
              <div className="flex items-center gap-3">
                <span className="text-base font-black text-yellow-500/60 w-6 text-center">{item.icon}</span>
                <span className="font-extrabold text-neutral-300 tracking-widest uppercase text-sm">{item.pair}</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap size={12} className="text-neutral-700" />
                <span className="text-neutral-700 font-mono italic text-xs tracking-[0.3em]">{item.signal}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== Info Box ===== */}
      <div className="flex gap-4 items-start bg-blue-500/5 border border-blue-500/15 p-5 rounded-2xl">
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

    </div>
  )
}