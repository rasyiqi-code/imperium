'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { MemberVIP } from '@/lib/types' 
import StatusCard from '@/components/StatusCard'
import DiscordCard from '@/components/DiscordCard'
import { Crown, Lock, TrendingUp, AlertCircle, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Samakan dengan interface di lib/types.ts lu biar gak bentrok
import { StatusAktif } from '@/lib/types'


export default function UserDashboard() {
  const [member, setMember] = useState<MemberVIP | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Sync pending payment status with Midtrans first
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
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
      <div className="text-neutral-500 font-black uppercase tracking-widest text-center">Sinkronisasi Data...</div>
    </div>
  )

  const isVip = member?.status_aktif === 'aktif' || member?.status_aktif === 'vip'
  const goToUpgrade = () => router.push('/dashboard/upgrade')

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 text-left">
      
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Selamat Datang, <span className="text-yellow-500 uppercase">{member?.nama_member?.split(' ')[0]}</span>!
          </h1>
          <p className="text-neutral-400 mt-2 font-medium">Akses komunitas dan pantau status membership kamu.</p>
        </div>
        
        <button 
          onClick={goToUpgrade}
          className="bg-yellow-500 hover:bg-yellow-400 text-black px-6 py-3 rounded-xl font-black transition-all flex items-center gap-2 shadow-xl shadow-yellow-500/20 active:scale-95 uppercase text-xs tracking-wider"
        >
          <Crown size={20} /> {isVip ? 'PERPANJANG / UBAH PAKET' : 'UPGRADE KE VIP'}
        </button>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusCard member={member} />
        <DiscordCard member={member} />
      </div>

      <div className="relative overflow-hidden bg-neutral-900/40 border border-neutral-800 p-8 rounded-3xl">
        {!isVip && (
          <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-md flex flex-col items-center justify-center text-center p-6">
            <Lock className="text-yellow-500 mb-4" size={40} />
            <h3 className="text-xl font-extrabold text-white mb-2 uppercase tracking-tight">Konten VIP Terkunci</h3>
            <p className="text-neutral-400 text-sm max-w-xs mb-6 font-bold uppercase opacity-70">
              Join VIP Imperium untuk akses sinyal trading harian dengan akurasi tinggi.
            </p>
            <button 
              onClick={goToUpgrade}
              className="bg-white text-black px-8 py-3 rounded-xl font-black hover:bg-yellow-500 transition-all shadow-lg active:scale-95 uppercase text-xs"
            >
              BUKA SINYAL SEKARANG
            </button>
          </div>
        )}

        <div className="flex items-center gap-3 mb-8">
          <div className="p-2.5 bg-green-500/10 rounded-xl text-green-500 border border-green-500/20">
            <TrendingUp size={24} />
          </div>
          <h3 className="text-xl font-black text-white tracking-tighter uppercase">Live Trading Signals</h3>
        </div>

        <div className="space-y-4">
          <div className="p-5 bg-black/40 border border-neutral-800 rounded-2xl flex justify-between items-center group hover:border-neutral-700 transition-all">
            <div className="font-black text-neutral-300 tracking-widest uppercase text-sm">BTC / USDT</div>
            <div className="text-neutral-600 font-mono italic text-xs tracking-[0.3em]">HIDDEN_SIGNAL</div>
          </div>
          <div className="p-5 bg-black/40 border border-neutral-800 rounded-2xl flex justify-between items-center group hover:border-neutral-700 transition-all">
            <div className="font-black text-neutral-300 tracking-widest uppercase text-sm">ETH / USDT</div>
            <div className="text-neutral-600 font-mono italic text-xs tracking-[0.3em]">HIDDEN_SIGNAL</div>
          </div>
        </div>
      </div>

      <div className="bg-blue-500/5 border border-blue-500/20 p-6 rounded-2xl flex gap-4 items-start">
        <AlertCircle className="text-blue-400 shrink-0 mt-0.5" size={20} />
        <div>
          <h3 className="text-white font-black text-xs mb-1.5 uppercase tracking-[0.2em]">Informasi Penting</h3>
          <ul className="text-xs text-neutral-400 list-disc ml-5 space-y-1 font-bold uppercase opacity-80">
            <li>Link invite Discord bersifat <span className="text-white font-black">Sekali Pakai</span> per akun.</li>
            <li>Status VIP akan diperbarui otomatis via Midtrans maksimal 1x24 jam.</li>
            <li>Dilarang membagikan sinyal Imperium ke publik/komunitas lain.</li>
          </ul>
        </div>
      </div>

    </div>
  )
}