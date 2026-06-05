'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Upload, CheckCircle2, RefreshCw, Info } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

/** Ekstensi file gambar yang diizinkan untuk bukti transfer */
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp']

interface PaymentProofFormProps {
  /** Menandai apakah proses submit sedang berjalan */
  loading: boolean
  /** Callback ketika user mengirim form dengan file yang sudah tervalidasi */
  onSubmit: (file: File) => void
}

/**
 * Komponen form unggah bukti pembayaran manual.
 * Mencakup validasi tipe file, preview gambar, instruksi transfer,
 * dan tombol submit.
 */
export default function PaymentProofForm({ loading, onSubmit }: PaymentProofFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const { showAlert } = useModal()

  /** Validasi ekstensi & tipe MIME saat user memilih file */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const selected = e.target.files[0]
      const fileExt = selected.name.split('.').pop()?.toLowerCase()

      if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt) || !selected.type.startsWith('image/')) {
        showAlert({
          title: 'Format File Tidak Valid',
          message: 'Hanya diperbolehkan mengunggah file gambar (JPG, JPEG, PNG, GIF, WEBP)!',
          type: 'danger'
        })
        e.target.value = ''
        setFile(null)
        setPreview(null)
        return
      }

      setFile(selected)
      setPreview(URL.createObjectURL(selected))
    }
  }

  /** Validasi ulang sebelum mengirim ke parent melalui onSubmit */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      showAlert({
        title: 'Data Belum Lengkap',
        message: 'Mohon unggah bukti pembayaran terlebih dahulu.',
        type: 'warning'
      })
      return
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase()
    if (!fileExt || !ALLOWED_EXTENSIONS.includes(fileExt) || !file.type.startsWith('image/')) {
      showAlert({
        title: 'Format File Tidak Didukung',
        message: 'Format file tidak didukung! Harap unggah gambar.',
        type: 'danger'
      })
      return
    }

    onSubmit(file)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Area unggah bukti transfer */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-neutral-500 px-1 tracking-widest leading-none">Bukti Transfer</label>
        <div className={`relative border border-dashed rounded-xl transition-all flex flex-col items-center justify-center p-8 ${preview ? 'border-yellow-500 bg-yellow-500/5' : 'border-neutral-800 bg-neutral-900 hover:border-neutral-700'}`}>
          <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
          {preview ? (
            <div className="space-y-4 w-full flex flex-col items-center">
              <Image 
                src={preview} 
                alt="Preview" 
                width={320}
                height={160}
                unoptimized
                className="h-40 rounded-lg object-contain border border-neutral-800" 
              />
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

      {/* Instruksi pembayaran */}
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

      {/* Tombol submit */}
      <button 
        type="submit"
        disabled={loading || !file}
        className="w-full py-4 bg-yellow-500 text-black rounded-xl text-xs font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-yellow-400 disabled:opacity-50 transition-all active:scale-95 shadow-xl shadow-yellow-500/10"
      >
        {loading ? <RefreshCw className="animate-spin" size={18} /> : <CheckCircle2 size={18} />} Kirim Konfirmasi
      </button>
    </form>
  )
}
