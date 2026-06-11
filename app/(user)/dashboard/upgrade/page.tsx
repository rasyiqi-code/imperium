'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { PaketVIP, MemberVIP, Payment } from '@/lib/types'
import PricingCard from '@/components/payment/PricingCard'
import PaymentModal from '@/components/payment/PaymentModal'
import { CreditCard, ShieldCheck, Info } from 'lucide-react'
import Loader from '@/components/Loader'
import { calculateProratedPrice } from '@/lib/payment/helpers'

export default function UpgradePage() {
  const [paketList, setPaketList] = useState<PaketVIP[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showPayment, setShowPayment] = useState(false)
  const [upgradeMode, setUpgradeMode] = useState('stacking')
  const [currentMember, setCurrentMember] = useState<MemberVIP | null>(null)
  const [pendingPayment, setPendingPayment] = useState<Payment | null>(null)
  const [midtransUseSnap, setMidtransUseSnap] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [userRole, setUserRole] = useState<string>('loading')

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
            const useSnap = data.midtransUseSnap
            const pendingPay = data.pendingPayment
            const role = data.userRole

            setUpgradeMode(upMode)
            setMidtransUseSnap(!!useSnap)
            setUserRole(role || 'user')
            if (memberData) {
              setCurrentMember(memberData)
            }
            if (pendingPay) {
              setPendingPayment(pendingPay)
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
    return calculateProratedPrice(
      currentMember
        ? {
            created_at: currentMember.dibuat_pada
              ? new Date(currentMember.dibuat_pada)
              : currentMember.created_at
              ? new Date(currentMember.created_at)
              : null,
            status_aktif: currentMember.status_aktif,
            tanggal_berakhir: currentMember.tanggal_berakhir
              ? new Date(currentMember.tanggal_berakhir)
              : null,
            harga_bayar: currentMember.harga_bayar,
          }
        : null,
      paketHarga,
      upgradeMode
    )
  }

  const handlePaymentClick = async () => {
    if (!selectedId) return

    if (midtransUseSnap) {
      setLoadingPayment(true)
      try {
        const res = await fetch('/api/checkout/charge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paketId: selectedId,
            paymentType: 'qris' // Dummy paymentType untuk fallback
          })
        })
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data.error || 'Gagal memproses pembayaran')
        }

        if (data.type === 'redirect' && data.redirectUrl) {
          window.location.href = data.redirectUrl
        } else {
          throw new Error('Url redirect pembayaran Snap tidak ditemukan')
        }
      } catch (err: unknown) {
        console.error("Payment error:", err)
        const errMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat memproses pembayaran. Silakan coba lagi.'
        alert(errMsg)
      } finally {
        setLoadingPayment(false)
      }
    } else {
      setShowPayment(true)
    }
  }

  const selectedPaket = paketList.find((p) => p.id === selectedId)

  if (loading) return <Loader label="Menyiapkan Paket VIP..." />

  return (
    <div className="p-4 md:p-10 max-w-5xl mx-auto space-y-10 pb-40 animate-in fade-in duration-700">
      
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
          UPGRADE <span className="text-yellow-500">VIP</span>
        </h1>
      </div>

      {pendingPayment && (
        <div className="w-full flex gap-3.5 p-4.5 bg-yellow-500/10 rounded-2xl text-left items-start text-xs font-medium text-yellow-550 leading-relaxed shadow-lg">
          <Info size={16} className="text-yellow-500 shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-0.5">
            <p className="font-black text-white text-[11px] uppercase tracking-wider">Menunggu Verifikasi Manual</p>
            <p className="text-neutral-500 font-bold leading-normal">
              Anda telah mengonfirmasi pembayaran manual untuk paket <strong>{pendingPayment.nama_paket}</strong> (Rp {Number(pendingPayment.harga_bayar).toLocaleString('id-ID')}). 
              Silakan tunggu proses verifikasi admin selesai. Anda tidak dapat melakukan transaksi baru sementara waktu.
            </p>
          </div>
        </div>
      )}

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
            onClick={handlePaymentClick}
            disabled={!selectedId || !!pendingPayment || loadingPayment}
            className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-black py-5 rounded-4xl font-black shadow-2xl shadow-yellow-500/20 flex items-center justify-center gap-3 transition-all active:scale-95 tracking-tight text-sm cursor-pointer"
          >
            {pendingPayment ? (
              <>Verifikasi Sedang Diproses</>
            ) : loadingPayment ? (
              <>Memproses Pembayaran...</>
            ) : (
              <><CreditCard size={20}/> Bayar Sekarang</>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-neutral-600">
            <ShieldCheck size={14} />
            <span className="text-[9px] font-black tracking-widest">Encrypted Payment by Midtrans</span>
          </div>

          {userRole !== 'admin' && userRole !== 'vip' && currentMember?.status_aktif !== 'aktif' && currentMember?.status_aktif !== 'vip' && (
            <div className="pt-2 text-center">
              <span className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider mr-1">Atau</span>
              <Link 
                href="/dashboard/upgrade/confirm"
                className="text-[10px] text-yellow-500 hover:text-yellow-400 font-black uppercase tracking-wider transition-colors duration-300 underline underline-offset-4"
              >
                Bayar Manual
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Info Tambahan */}
      <p className="text-neutral-500 text-[11px] text-center leading-relaxed max-w-lg mx-auto italic">
        Akses VIP otomatis aktif setelah pembayaran berhasil.
      </p>

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