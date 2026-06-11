'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, ChevronDown, Clock, ExternalLink, Info } from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { PaketVIP, MemberVIP, Payment } from '@/lib/types'
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
  const [pendingPayment, setPendingPayment] = useState<Payment | null>(null)
  
  // State rekening manual
  const [manualBankName, setManualBankName] = useState('Bank Central Asia (BCA)')
  const [manualAccountNumber, setManualAccountNumber] = useState('3910382891')
  const [manualAccountName, setManualAccountName] = useState('M Rasyiqi')

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
            const pendingPay = data.pendingPayment

            if (memberData) setCurrentMember(memberData)
            setUpgradeMode(upMode)
            if (pendingPay) setPendingPayment(pendingPay)
            
            if (data.manualBankName) setManualBankName(data.manualBankName)
            if (data.manualAccountNumber) setManualAccountNumber(data.manualAccountNumber)
            if (data.manualAccountName) setManualAccountName(data.manualAccountName)

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

  if (fetching) return <Loader label="Memuat Riwayat Pembayaran..." />

  if (pendingPayment) {
    return (
      <div className="p-4 md:p-8 space-y-6 w-full mx-auto pb-32 bg-black min-h-screen text-white font-sans text-left animate-in fade-in duration-300">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-all cursor-pointer">
          <ArrowLeft size={18} />
          <span className="text-xs font-bold tracking-widest">Kembali</span>
        </button>

        <div className="space-y-1">
          <h1 className="text-sm font-bold uppercase tracking-tight">Manual Payment</h1>
          <p className="text-xs text-neutral-500 font-bold tracking-tight leading-none">Imperium Crypto VIP Portal</p>
        </div>

        {/* Status Pending Card */}
        <div className="rounded-3xl border border-yellow-500/20 bg-yellow-500/5 backdrop-blur-md p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/2 blur-2xl rounded-full" />
          
          <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 text-yellow-500 flex items-center justify-center shrink-0 animate-pulse">
                <Clock size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-black text-white">Menunggu Verifikasi Admin</h3>
                <p className="text-xs text-neutral-450 font-medium leading-relaxed">
                  Bukti transfer Anda telah kami terima dan saat ini sedang ditinjau oleh Admin. 
                  Akses VIP akan otomatis aktif setelah pembayaran dikonfirmasi.
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-yellow-500/20 bg-yellow-500/10 text-yellow-500 self-start md:self-auto shrink-0 leading-none">
              Pending
            </span>
          </div>

          <div className="border-t border-neutral-850 pt-5 space-y-4">
            <h4 className="text-xs font-bold text-neutral-400 tracking-wider uppercase">Rincian Transaksi</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-950 p-5 rounded-2xl border border-neutral-900">
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider block">Paket Pilihan</span>
                <span className="text-xs font-bold text-white block">{pendingPayment.nama_paket}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider block">Total Pembayaran</span>
                <span className="text-xs font-bold text-yellow-500 block">Rp {Number(pendingPayment.harga_bayar).toLocaleString('id-ID')}</span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider block">Tanggal Pengiriman</span>
                <span className="text-xs font-bold text-white block">
                  {pendingPayment.created_at ? new Date(pendingPayment.created_at).toLocaleString('id-ID') : '-'}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider block">Bukti Transfer</span>
                <a 
                  href={pendingPayment.bukti_transfer} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-500 hover:underline hover:text-yellow-400 leading-none cursor-pointer"
                >
                  Lihat Bukti Terkirim <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Warning / Informative Banner */}
          <div className="p-4 bg-neutral-900/40 rounded-xl border border-neutral-850 flex gap-3 items-start text-[11px] text-neutral-500 leading-relaxed font-medium">
            <Info size={16} className="text-neutral-500 shrink-0 mt-0.5" />
            <p>
              Untuk mencegah pembayaran ganda, Anda tidak dapat mengirim bukti transfer baru sebelum transaksi ini disetujui atau ditolak oleh Admin. 
              Pengecekan manual dilakukan setiap hari antara pukul <strong>09:00 - 21:00 WIB</strong>. Jika butuh bantuan cepat, silakan hubungi Support.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!selectedPaket) return <Loader label="Memuat Riwayat Pembayaran..." />

  return (
    <div className="p-4 md:p-8 space-y-6 w-full mx-auto pb-32 bg-black min-h-screen text-white font-sans text-left">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-neutral-500 hover:text-white transition-all cursor-pointer">
        <ArrowLeft size={18} />
        <span className="text-xs font-bold tracking-widest">Kembali</span>
      </button>

      <div className="space-y-1">
        <h1 className="text-sm font-bold uppercase tracking-tight">Manual Payment</h1>
        <p className="text-xs text-neutral-500 font-bold tracking-tight leading-none">Imperium Crypto VIP Portal</p>
      </div>

      {/* Detail Rekening Pembayaran Manual */}
      <div className="p-5 rounded-2xl bg-neutral-900 border border-neutral-800 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
          <span className="text-xs font-bold text-neutral-400">Rekening Tujuan Transfer</span>
          <span className="text-[9px] font-black text-yellow-500 tracking-widest bg-yellow-500/10 px-2.5 py-0.5 rounded-full border border-yellow-500/10 uppercase">TRANSFER MANUAL</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-left space-y-1">
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider block">Bank</span>
            <span className="text-xs font-bold text-white block">{manualBankName}</span>
          </div>
          <div className="text-left space-y-1">
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider block">Atas Nama</span>
            <span className="text-xs font-bold text-white block">{manualAccountName}</span>
          </div>
          <div className="text-left space-y-1">
            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-wider block">Nomor Rekening</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-yellow-500">{manualAccountNumber}</span>
              <button 
                onClick={() => {
                  if (manualAccountNumber) {
                    navigator.clipboard.writeText(manualAccountNumber)
                    showAlert({
                      title: 'Tersalin',
                      message: 'Nomor rekening berhasil disalin!',
                      type: 'success'
                    })
                  }
                }}
                className="text-[9px] font-black text-neutral-400 hover:text-white px-2 py-1 bg-neutral-800 border border-neutral-750 rounded-lg hover:border-neutral-700 transition-all active:scale-95 cursor-pointer leading-none"
              >
                Salin
              </button>
            </div>
          </div>
        </div>
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