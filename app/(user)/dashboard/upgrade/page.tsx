'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PaketVIP } from '@/lib/types'
import PricingCard from '@/components/PricingCard'
import PaymentModal from '@/components/PaymentModal'
import { RefreshCw, CreditCard, ShieldCheck } from 'lucide-react'

export default function UpgradePage() {
  const [paketList, setPaketList] = useState<PaketVIP[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [upgradeMode, setUpgradeMode] = useState('stacking')
  const [currentMember, setCurrentMember] = useState<any>(null)

  useEffect(() => {
    async function loadPaket() {
      const [authRes, paketRes, configData] = await Promise.all([
        supabase.auth.getUser(),
        supabase.from('data_paket_vip').select('*').order('harga', { ascending: true }),
        fetch('/api/config/midtrans').then(res => res.json()).catch(() => ({ upgradeMode: 'stacking' }))
      ])

      const user = authRes.data?.user;
      let memberData = null;
      if (user) {
        const { data } = await supabase.from('data_member_vip').select('*').eq('id_user_auth', user.id).maybeSingle();
        memberData = data;
      }

      if (configData && configData.upgradeMode) {
        setUpgradeMode(configData.upgradeMode)
      }
      if (memberData) {
        setCurrentMember(memberData)
      }

      if (!paketRes.error && paketRes.data) {
        const packages = paketRes.data as PaketVIP[]
        setPaketList(packages)
        if (packages.length > 0) setSelectedId(packages[0].id)
      }
      setLoading(false)
    }
    loadPaket()
  }, [])

  const getProratedPrice = (paketHarga: number) => {
    if (upgradeMode !== 'proration' || !currentMember) return paketHarga

    const { status_aktif, tanggal_berakhir, dibuat_pada, created_at, harga_bayar } = currentMember
    if ((status_aktif === 'aktif' || status_aktif === 'vip') && tanggal_berakhir) {
      const today = new Date()
      const expiry = new Date(tanggal_berakhir)

      if (expiry > today) {
        const created = dibuat_pada 
          ? new Date(dibuat_pada) 
          : (created_at ? new Date(created_at) : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000))

        let totalDays = Math.ceil((expiry.getTime() - created.getTime()) / (24 * 60 * 60 * 1000))
        if (totalDays <= 0) totalDays = 30

        let remainingDays = Math.ceil((expiry.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
        if (remainingDays < 0) remainingDays = 0

        const oldPaidAmount = Number(harga_bayar) || 0
        const remainingValue = oldPaidAmount * (remainingDays / totalDays)

        return Math.max(10000, paketHarga - remainingValue)
      }
    }
    return paketHarga
  }

  const selectedPaket = paketList.find((p) => p.id === selectedId)

  if (loading) return (
    <div className="p-10 flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <RefreshCw className="animate-spin text-yellow-500" size={40} />
      <p className="text-neutral-500 font-bold uppercase tracking-widest text-[10px]">Menyiapkan Paket VIP...</p>
    </div>
  )

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-10 pb-40 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter">
          UPGRADE <span className="text-yellow-500">VIP</span>
        </h1>
        <p className="text-neutral-500 text-sm md:text-base max-w-md mx-auto font-medium">
          Dapatkan akses sinyal harian dan belajar Crypto secara profesional bersama komunitas eksklusif.
        </p>
      </div>

      {/* Grid Pricing: Responsif 1 kol (mobile) / 2 kol (PC) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {paketList.map((p) => (
          <PricingCard 
            key={p.id} 
            paket={p} 
            isSelected={selectedId === p.id} 
            onSelect={setSelectedId} 
            proratedHarga={getProratedPrice(Number(p.harga))}
          />
        ))}
      </div>

      {/* Payment Button Container */}
      <div className="flex flex-col items-center gap-6 pt-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <button 
            onClick={() => setShowPayment(true)}
            disabled={!selectedId}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black py-5 rounded-4xl font-black shadow-2xl shadow-yellow-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-tight text-sm"
          >
            <CreditCard size={20}/> BAYAR SEKARANG
          </button>

          <div className="flex items-center justify-center gap-2 text-neutral-600">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Payment by Midtrans</span>
          </div>
        </div>
      </div>

      {/* Info Tambahan */}
      <div className="bg-neutral-900/30 border border-neutral-800 p-6 rounded-3xl text-center">
        <p className="text-neutral-500 text-[11px] leading-relaxed max-w-lg mx-auto italic">
          Akses VIP akan terbuka secara otomatis segera setelah transaksi berhasil divalidasi oleh sistem perbankan.
        </p>
      </div>

      {/* Payment Modal */}
      {selectedPaket && (
        <PaymentModal
          isOpen={showPayment}
          onClose={() => setShowPayment(false)}
          paketId={selectedPaket.id}
          paketNama={selectedPaket.nama_paket}
          harga={getProratedPrice(Number(selectedPaket.harga))}
          onSuccess={() => {
            window.location.href = '/dashboard'
          }}
        />
      )}
    </div>
  )
}