'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { PaketVIP, MemberVIP } from '@/lib/types'
import { useModal } from '@/components/ModalProvider'
import Loader from '@/components/Loader'
import { calculateProratedPrice } from '@/lib/payment/helpers'
import PaymentProofForm from '@/components/dashboard/upgrade/PaymentProofForm'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')
  const { showAlert } = useModal()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  
  const [listPaket, setListPaket] = useState<PaketVIP[]>([])
  const [selectedPaket, setSelectedPaket] = useState<PaketVIP | null>(null)
  const [upgradeMode, setUpgradeMode] = useState('stacking')
  const [currentMember, setCurrentMember] = useState<MemberVIP | null>(null)

  // Load Data dengan Guard
  useEffect(() => {
    let isMounted = true;
    
    async function initPage() {
      try {
        setFetching(true)
        const authRes = await supabase.auth.getUser()
        if (!isMounted) return

        const user = authRes.data?.user;
        if (user) {
          setUser(user)
          
          const res = await fetch('/api/user/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'getUpgradeData' })
          })
          const data = await res.json()

          if (isMounted && res.ok) {
            const memberData = data.memberData
            const packages = data.paketList || []
            const upMode = data.upgradeMode

            if (memberData) setCurrentMember(memberData)
            setUpgradeMode(upMode)

            if (packages.length > 0) {
              setListPaket(packages)
              const initial = planParam 
                ? packages.find((p: PaketVIP) => p.id === planParam) || packages[0]
                : packages[0]
              setSelectedPaket(initial)
            }
          }
        }
      } catch (err) {
        console.error("Init error:", err)
      } finally {
        if (isMounted) setFetching(false)
      }
    }

    initPage()
    return () => { isMounted = false }
  }, [planParam])

  const getProratedPrice = useCallback((paketHarga: number) => {
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
  }, [upgradeMode, currentMember])

  /** Callback dari PaymentProofForm: upload file lalu kirim transaksi ke backend */
  const handleProofSubmit = async (file: File) => {
    if (!user || !selectedPaket) {
      showAlert({
        title: 'Data Belum Lengkap',
        message: 'Mohon pastikan semua data terisi.',
        type: 'warning'
      })
      return
    }

    setLoading(true)
    try {
      const fileExt = file.name.split('.').pop()?.toLowerCase()
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      // 1. Upload ke Storage
      const { error: upErr } = await supabase.storage.from('pembayaran').upload(fileName, file)
      if (upErr) throw upErr

      const { data: { publicUrl } } = supabase.storage.from('pembayaran').getPublicUrl(fileName)

      // 2. Kirim data transaksi secara aman ke backend
      const res = await fetch('/api/user/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'submitManualPayment',
          planId: selectedPaket.id,
          publicUrl
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan transaksi pembayaran')
      
      showAlert({
        title: 'Pembayaran Terkirim',
        message: 'Bukti transfer berhasil dikirim. Pembayaran Anda akan segera diverifikasi oleh Admin!',
        type: 'success',
        onConfirm: () => {
          router.push('/dashboard')
        }
      })
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Pengiriman Gagal',
        message: `Terjadi kesalahan: ${error.message}`,
        type: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }

  if (fetching || !selectedPaket) return <Loader label="Memuat Riwayat Pembayaran..." />
  return (
    <div className="p-4 md:p-8 space-y-6 w-full mx-auto pb-32 bg-black min-h-screen text-white font-sans text-left">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-all">
        <ArrowLeft size={18} />
        <span className="text-xs font-bold tracking-widest">Kembali</span>
      </button>

      <div className="space-y-1">
        <h1 className="text-sm font-bold uppercase tracking-tight">Konfirmasi Pembayaran</h1>
        <p className="text-xs text-neutral-500 font-bold tracking-tight leading-none">Imperium Crypto VIP Portal</p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold text-neutral-500 px-1 tracking-widest leading-none">Pilih Paket</label>
        <div className="relative">
          <select 
            value={selectedPaket.id}
            onChange={(e) => {
              const found = listPaket.find(p => p.id === e.target.value)
              if (found) setSelectedPaket(found)
            }}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-xs font-bold outline-none appearance-none focus:border-yellow-500 transition-all cursor-pointer text-white"
          >
            {listPaket.map((p) => {
              const displayPrice = getProratedPrice(Number(p.harga))
              const isProrated = displayPrice < Number(p.harga)
              return (
                <option key={p.id} value={p.id} className="bg-neutral-900 text-white">
                  {p.nama_paket} - Rp {displayPrice.toLocaleString('id-ID')} {isProrated ? '(Potong Harga Prorasi)' : ''}
                </option>
              )
            })}
          </select>
          <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
        </div>
      </div>

      <div className="p-5 rounded-xl bg-neutral-900 border border-neutral-800 flex justify-between items-center">
        <div className="text-left">
          <span className="text-xs font-bold text-neutral-500 leading-none block">Total Tagihan</span>
          {getProratedPrice(Number(selectedPaket.harga)) < Number(selectedPaket.harga) && (
            <span className="text-[10px] text-green-500 font-bold mt-1 block">Potongan Harga Prorasi Aktif</span>
          )}
        </div>
        <div className="text-right">
          {getProratedPrice(Number(selectedPaket.harga)) < Number(selectedPaket.harga) && (
            <span className="text-xs text-neutral-500 line-through mr-2 font-bold">
              Rp {Number(selectedPaket.harga).toLocaleString('id-ID')}
            </span>
          )}
          <span className="text-sm font-bold text-yellow-500 tracking-tighter leading-none">
            Rp {getProratedPrice(Number(selectedPaket.harga)).toLocaleString('id-ID')}
          </span>
        </div>
      </div>

      {/* Form unggah bukti transfer (komponen modular) */}
      <PaymentProofForm loading={loading} onSubmit={handleProofSubmit} />
    </div>
  )
}

export default function ConfirmPayment() {
  return (
    <Suspense fallback={<Loader label="Menyiapkan Konfirmasi..." fullScreen={true} />}>
      <ConfirmContent />
    </Suspense>
  )
}