'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Upload, CheckCircle2, RefreshCw, 
  ArrowLeft, Info, ChevronDown 
} from 'lucide-react'
import { User } from '@supabase/supabase-js'
import { PaketVIP, MemberVIP } from '@/lib/types'
import { useModal } from '@/components/ModalProvider'

function ConfirmContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planParam = searchParams.get('plan')
  const { showAlert } = useModal()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
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
  }, [upgradeMode, currentMember])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0]
      const fileExt = selected.name.split('.').pop()?.toLowerCase();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
      
      if (!fileExt || !allowedExtensions.includes(fileExt) || !selected.type.startsWith('image/')) {
        showAlert({
          title: 'Format File Tidak Valid',
          message: 'Hanya diperbolehkan mengunggah file gambar (JPG, JPEG, PNG, GIF, WEBP)!',
          type: 'danger'
        });
        e.target.value = '';
        setFile(null);
        setPreview(null);
        return;
      }
      
      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !user || !selectedPaket) {
      showAlert({
        title: 'Data Belum Lengkap',
        message: 'Mohon unggah bukti pembayaran dan pastikan semua data terisi.',
        type: 'warning'
      })
      return
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    if (!fileExt || !allowedExtensions.includes(fileExt) || !file.type.startsWith('image/')) {
      showAlert({
        title: 'Format File Tidak Didukung',
        message: 'Format file tidak didukung! Harap unggah gambar.',
        type: 'danger'
      })
      return;
    }

    setLoading(true)
    try {
      const fileName = `${user.id}-${Date.now()}.${fileExt}`
      
      // 1. Upload Storage
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

  if (fetching || !selectedPaket) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-3">
          <label className="text-xs font-bold text-neutral-500 px-1 tracking-widest leading-none">Bukti Transfer</label>
          <div className={`relative border border-dashed rounded-xl transition-all flex flex-col items-center justify-center p-8 ${preview ? 'border-yellow-500 bg-yellow-500/5' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}>
            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
            {preview ? (
              <div className="space-y-4 w-full flex flex-col items-center">
                <img src={preview} alt="Preview" className="h-40 rounded-lg object-contain border border-neutral-800" />
                <p className="text-xs font-bold text-yellow-500 tracking-widest">Ganti Foto</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-neutral-500">
                <div className="p-3 bg-black rounded-xl border border-neutral-800">
                  <Upload size={20} />
                </div>
                <p className="text-xs font-bold tracking-widest">Tap Untuk Upload</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 p-4 bg-neutral-900/50 rounded-xl border border-neutral-800 items-start">
          <Info size={16} className="text-yellow-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold text-neutral-400 leading-relaxed tracking-tight">Instruksi Pembayaran</p>
            <div className="text-xs text-neutral-500 font-bold space-y-1 leading-relaxed">
              <p>• Nama Pengirim Harus Terlihat Jelas</p>
              <p>• Nominal Harus Sesuai Total Tagihan</p>
              <p>• Pengecekan Jam 09:00 - 21:00 WIB</p>
            </div>
          </div>
        </div>
 
        <button 
          type="submit"
          disabled={loading || !file}
          className="w-full py-4 bg-yellow-500 text-black rounded-xl text-xs font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-yellow-500/10"
        >
          {loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Kirim Konfirmasi
        </button>
      </form>
    </div>
  )
}

export default function ConfirmPayment() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <ConfirmContent />
    </Suspense>
  )
}