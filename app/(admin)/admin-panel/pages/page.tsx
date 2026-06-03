'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { 
  Save, RefreshCw, FileText, Info, Shield, HelpCircle, Eye 
} from 'lucide-react'
import { useModal } from '@/components/ModalProvider'
import Loader from '@/components/Loader'

interface SupportConfig {
  about_content: string
  privacy_content: string
  terms_content: string
  help_content: string
}

type TabType = 'about' | 'privacy' | 'terms' | 'help'

export default function AdminPageManager() {
  const { showAlert } = useModal()
  const [config, setConfig] = useState<SupportConfig>({
    about_content: '',
    privacy_content: '',
    terms_content: '',
    help_content: ''
  })
  const [activeTab, setActiveTab] = useState<TabType>('about')
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

  // Tab Config metadata
  const tabMeta = [
    { id: 'about' as TabType, name: 'Tentang Kami', icon: <Info size={16} />, label: 'Tentang', desc: 'Company Profile & Visi Misi' },
    { id: 'privacy' as TabType, name: 'Privacy Policy', icon: <Shield size={16} />, label: 'Privasi', desc: 'Kebijakan Perlindungan Data' },
    { id: 'terms' as TabType, name: 'Terms of Service', icon: <FileText size={16} />, label: 'Ketentuan', desc: 'Aturan Penggunaan Komunitas' },
    { id: 'help' as TabType, name: 'Pusat Bantuan', icon: <HelpCircle size={16} />, label: 'Bantuan', desc: 'Panduan Bantuan & Layanan Bantuan' }
  ]

  const activeMeta = tabMeta.find(t => t.id === activeTab)

  // Get active text content for char counter & text manipulation
  const getActiveContentKey = () => {
    switch (activeTab) {
      case 'about': return 'about_content'
      case 'privacy': return 'privacy_content'
      case 'terms': return 'terms_content'
      case 'help': return 'help_content'
    }
  }

  const activeKey = getActiveContentKey()
  const textValue = config[activeKey] || ''

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white text-left font-sans animate-in fade-in duration-300">

      {/* Header Halaman */}
      <div className="border-b border-neutral-800 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            Page <span className="text-yellow-500">Manager</span>
          </h1>
          <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider uppercase">Kelola dan kustomisasi konten informasi dinamis untuk portal utama</p>
        </div>
        <button 
          onClick={handleUpdateConfig} 
          disabled={isSaving} 
          className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 cursor-pointer"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} Simpan Semua Perubahan
        </button>
      </div>

      {/* Grid Tab Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tabMeta.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                isActive 
                  ? 'border-yellow-500/40 bg-yellow-500/[0.03] shadow-[0_4px_20px_rgba(234,179,8,0.05)]' 
                  : 'border-neutral-800 bg-neutral-950/20 hover:border-neutral-700/50'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-yellow-500" />
              )}
              <div className="flex items-center gap-2.5">
                <div className={`p-2 rounded-xl transition-colors duration-300 ${isActive ? 'bg-yellow-500 text-black' : 'bg-neutral-900 text-neutral-400 group-hover:text-yellow-500'}`}>
                  {tab.icon}
                </div>
                <div className="min-w-0">
                  <p className={`text-xs font-black uppercase tracking-wide leading-none ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>{tab.label}</p>
                  <p className="text-[9px] text-neutral-500 font-bold truncate mt-1 leading-none">{tab.desc}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Dua Kolom Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Kolom Editor (Kiri) */}
        <div className="lg:col-span-7 bg-neutral-950/30 backdrop-blur-md border border-neutral-800/80 rounded-3xl p-6 flex flex-col justify-between shadow-xl">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <div>
                <h3 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                  Edit Konten: {activeMeta?.name}
                </h3>
                <p className="text-[9px] text-neutral-500 font-bold mt-1 tracking-wider uppercase">Gunakan paragraf baru (Enter) untuk spasi pemisah konten yang indah</p>
              </div>
              <span className="text-[9px] font-bold px-2 py-1 rounded bg-neutral-900 text-neutral-400 border border-neutral-800 uppercase tracking-widest leading-none shrink-0">
                {textValue.length} Karakter
              </span>
            </div>

            <div className="space-y-1">
              <textarea 
                value={textValue} 
                onChange={(e) => setConfig({ ...config, [activeKey]: e.target.value })} 
                className="w-full bg-neutral-900/10 border border-neutral-850 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-2xl p-4 text-xs font-medium outline-none text-white placeholder-neutral-600 min-h-[350px] leading-relaxed font-mono" 
                placeholder={`Tulis konten halaman ${activeMeta?.name.toLowerCase()} di sini...`}
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <span className="text-[9px] font-bold text-neutral-500 tracking-wider">Perubahan langsung ter-render di Live Preview</span>
            <button 
              onClick={handleUpdateConfig} 
              disabled={isSaving} 
              className="w-full sm:w-auto px-5 py-3 bg-neutral-900 hover:bg-neutral-850 text-yellow-500 hover:text-yellow-400 border border-neutral-800 hover:border-neutral-700 font-black rounded-xl text-[10px] tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              {isSaving ? <RefreshCw className="animate-spin" size={12} /> : <Save size={12} />} Simpan Halaman Ini
            </button>
          </div>
        </div>

        {/* Kolom Live Preview (Kanan) */}
        <div className="lg:col-span-5 bg-neutral-950/20 backdrop-blur-md border border-neutral-900 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group">
          {/* Ornamen Pendaran radial redup di pojok preview */}
          <div className="absolute -right-16 -bottom-16 w-40 h-40 bg-yellow-500/[0.02] rounded-full blur-2xl pointer-events-none -z-15" />
          
          <div className="space-y-4 flex-grow flex flex-col">
            <div className="flex justify-between items-center border-b border-neutral-900 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-450 flex items-center gap-2">
                <Eye size={14} className="text-yellow-500" /> Live Preview
              </h3>
              <span className="text-[8px] font-black px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/10 text-yellow-500 uppercase tracking-widest leading-none shrink-0">
                Front-end Tampilan
              </span>
            </div>

            {/* Simulasi Casing Glassmorphism Halaman Depan */}
            <div className="flex-grow bg-black/60 border border-white/[0.04] rounded-2xl p-6 relative min-h-[300px] flex flex-col justify-between">
              {/* Efek Garis Emas Halus di Bagian Atas Card */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/40 to-transparent" />
              
              <div className="space-y-4">
                {/* Header Judul Halaman Depan */}
                <div className="text-center pb-4 border-b border-white/[0.04]">
                  <h4 className="text-[9px] font-black uppercase tracking-wider text-[#d4af37] leading-none mb-1">
                    {activeMeta?.id === 'about' ? 'Company Profile' : activeMeta?.id === 'privacy' ? 'Security & Privacy' : activeMeta?.id === 'terms' ? 'Terms & Rules' : 'Support Center'}
                  </h4>
                  <h2 className="text-base font-black uppercase text-white tracking-wide leading-none">
                    {activeMeta?.name}
                  </h2>
                </div>

                {/* Body Content Real-time render */}
                <div className="text-[10px] sm:text-xs text-neutral-400 font-medium leading-relaxed space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {textValue ? (
                    textValue.split('\n').map((para, idx) => (
                      <p key={idx} className="whitespace-pre-line text-left">
                        {para}
                      </p>
                    ))
                  ) : (
                    <p className="text-neutral-600 italic text-center py-10 uppercase tracking-wider font-bold text-[9px]">Belum ada konten yang ditulis...</p>
                  )}
                </div>
              </div>

              {/* Simulasi CTA Bawah */}
              <div className="border-t border-white/[0.04] pt-4 mt-4 text-center">
                <div className="inline-block bg-[#d4af37] text-black px-4 py-1.5 rounded-full font-bold text-[8px] uppercase tracking-widest scale-95 opacity-70">
                  {activeMeta?.id === 'about' ? 'Gabung VIP Komunitas' : activeMeta?.id === 'help' ? 'Kirim WhatsApp' : 'Kembali Ke Beranda'}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
