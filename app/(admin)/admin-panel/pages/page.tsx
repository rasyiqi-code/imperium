'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Save, RefreshCw, FileText } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'
import Loader from '@/components/Loader'

interface SupportConfig {
  about_content: string
  privacy_content: string
  terms_content: string
  help_content: string
}

export default function AdminPageManager() {
  const { showAlert } = useModal()
  const [config, setConfig] = useState<SupportConfig>({
    about_content: '',
    privacy_content: '',
    terms_content: '',
    help_content: ''
  })
  const [loading, setLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const isMounted = useRef(true)

  const fetchData = useCallback(async () => {
    if (!isMounted.current) return
    setLoading(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getSupportData' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil data halaman')
      if (isMounted.current && data.config) {
        setConfig({
          about_content: data.config.about_content || '',
          privacy_content: data.config.privacy_content || '',
          terms_content: data.config.terms_content || '',
          help_content: data.config.help_content || ''
        })
      }
    } catch (err: unknown) {
      console.error(err)
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    const timer = setTimeout(() => {
      fetchData()
    }, 0)
    return () => {
      isMounted.current = false
      clearTimeout(timer)
    }
  }, [fetchData])

  const handleUpdateConfig = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateSupportConfig', config })
      })
      const data = await res.json()
      if (!res.ok) {
        showAlert({
          title: 'Gagal Update',
          message: data.error || 'Gagal update halaman',
          type: 'danger'
        })
      } else {
        showAlert({
          title: 'Berhasil',
          message: 'Konten Halaman Dinamis Berhasil Diperbarui!',
          type: 'success'
        })
      }
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Error',
        message: `Gagal: ${error.message}`,
        type: 'danger'
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) return <Loader label="Memuat Konten Halaman..." />

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white text-left font-sans animate-in fade-in duration-300">

      {/* Title */}
      <div className="border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">Page <span className="text-yellow-500">Manager</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Kelola konten teks dinamis untuk halaman Tentang, Kebijakan Privasi, Ketentuan Layanan, dan Bantuan</p>
      </div>

      {/* Form Editor Halaman Dinamis */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1 flex items-center gap-2">
          <FileText size={14} className="text-yellow-500" /> Konten Halaman Dinamis
        </h3>
        <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 grid grid-cols-1 gap-6 shadow-lg">
          
          {/* Tentang Kami */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1 uppercase">Tentang Kami (About Us)</label>
            <textarea 
              value={config.about_content} 
              onChange={(e) => setConfig({ ...config, about_content: e.target.value })} 
              className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600 min-h-28" 
              placeholder="Tulis informasi profil komunitas..."
            />
          </div>

          {/* Kebijakan Privasi */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1 uppercase">Kebijakan Privasi (Privacy Policy)</label>
            <textarea 
              value={config.privacy_content} 
              onChange={(e) => setConfig({ ...config, privacy_content: e.target.value })} 
              className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600 min-h-40" 
              placeholder="Tulis syarat dan kebijakan perlindungan data..."
            />
          </div>

          {/* Syarat & Ketentuan */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1 uppercase">Syarat & Ketentuan (Terms of Service)</label>
            <textarea 
              value={config.terms_content} 
              onChange={(e) => setConfig({ ...config, terms_content: e.target.value })} 
              className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600 min-h-40" 
              placeholder="Tulis aturan keanggotaan dan ketentuan komunitas..."
            />
          </div>

          {/* Deskripsi Halaman Bantuan */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1 uppercase">Deskripsi Halaman Bantuan (Help Desk)</label>
            <textarea 
              value={config.help_content} 
              onChange={(e) => setConfig({ ...config, help_content: e.target.value })} 
              className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600 min-h-28" 
              placeholder="Tulis pengantar halaman Pusat Bantuan..."
            />
          </div>

          {/* Tombol Simpan */}
          <button 
            onClick={handleUpdateConfig} 
            disabled={isSaving} 
            className="py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all duration-300 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 cursor-pointer"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} Simpan Halaman
          </button>
        </div>
      </div>

    </div>
  )
}
