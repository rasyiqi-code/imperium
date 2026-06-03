'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { PaketVIP, MemberVIP } from '@/lib/types'
import PricingCard from '@/components/PricingCard'
import PaymentModal from '@/components/PaymentModal'
import { CreditCard, ShieldCheck } from 'lucide-react'
import Loader from '@/components/Loader'

export default function UpgradePage() {
  const [paketList, setPaketList] = useState<PaketVIP[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [upgradeMode, setUpgradeMode] = useState('stacking')
  const [currentMember, setCurrentMember] = useState<MemberVIP | null>(null)

  useEffect(() => {
    async function loadPaket() {
      try {
        const authRes = await supabase.auth.getUser()
        const user = authRes.data?.user

        if (user) {
          const res = await fetch('/api/user/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getUpgradeData' })
          })
          const data = await res.json()

          if (res.ok) {
            const allPackages = (data.paketList as PaketVIP[]) || []
            // Hanya tampilkan paket VIP berbayar di halaman upgrade
            const packages = allPackages.filter(p => Number(p.harga) > 0)
            const memberData = data.memberData
            const upMode = data.upgradeMode

            setUpgradeMode(upMode)
            if (memberData) {
              setCurrentMember(memberData)
            }

            setPaketList(packages)
            if (packages.length > 0) {
              const activePkg = memberData && (memberData.status_aktif === 'aktif' || memberData.status_aktif === 'vip') ? memberData.nama_paket : null;
              const selectable = packages.find(p => p.nama_paket !== activePkg) || packages[0];
              setSelectedId(selectable.id);
            }
          }
        }
      } catch (err) {
        console.error("Gagal memuat data paket upgrade:", err)
      } finally {
        setLoading(false)
      }
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

  if (loading) return <Loader label="Menyiapkan Paket VIP..." />

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-10 pb-40 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
          UPGRADE <span className="text-yellow-500">VIP</span>
        </h1>
        <p className="text-neutral-500 text-sm md:text-base max-w-md mx-auto font-medium">
          Dapatkan akses sinyal harian dan belajar Crypto secara profesional bersama komunitas eksklusif.
        </p>
      </div>

      {/* Grid Pricing: Responsif 1 kol (mobile) / 2 kol (PC) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {paketList.map((p) => {
          const isActive = currentMember && 
            (currentMember.status_aktif === 'aktif' || currentMember.status_aktif === 'vip') && 
            currentMember.nama_paket === p.nama_paket;
          return (
            <PricingCard 
              key={p.id} 
              paket={p} 
              isSelected={selectedId === p.id} 
              onSelect={setSelectedId} 
              isActivePackage={!!isActive}
              upgradeMode={upgradeMode}
            />
          );
        })}
      </div>

      {/* Payment Button Container */}
      <div className="flex flex-col items-center gap-6 pt-4">
        <div className="w-full max-w-md space-y-4 text-center">
          <button 
            onClick={() => setShowPayment(true)}
            disabled={!selectedId}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black py-5 rounded-4xl font-black shadow-2xl shadow-yellow-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 tracking-tight text-sm"
          >
            <CreditCard size={20}/> Bayar Sekarang
          </button>

          <div className="flex items-center justify-center gap-2 text-neutral-600">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black tracking-widest">Encrypted Payment by Midtrans</span>
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
          originalHarga={Number(selectedPaket.harga)}
          onSuccess={() => {
            window.location.href = '/dashboard'
          }}
        />
      )}
    </div>
  )
}