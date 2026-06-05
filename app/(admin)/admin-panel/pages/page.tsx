'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { 
  Save, RefreshCw, FileText, Info, Shield, HelpCircle 
} from 'lucide-react'
import { useModal } from '@/components/ModalProvider'
import Loader from '@/components/Loader'
import PageEditor from '@/components/admin/pages/PageEditor'
import PageLivePreview from '@/components/admin/pages/PageLivePreview'

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

  // Ambil data konten halaman statis dari API
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

  // Tangani pembaruan konfigurasi konten
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

  // Konfigurasi metadata tab navigasi
  const tabMeta = [
    { id: 'about' as TabType, name: 'Tentang Kami', icon: <Info size={16} />, label: 'Tentang', desc: 'Company Profile & Visi Misi' },
    { id: 'privacy' as TabType, name: 'Privacy Policy', icon: <Shield size={16} />, label: 'Privasi', desc: 'Kebijakan Perlindungan Data' },
    { id: 'terms' as TabType, name: 'Terms of Service', icon: <FileText size={16} />, label: 'Ketentuan', desc: 'Aturan Penggunaan Komunitas' },
    { id: 'help' as TabType, name: 'Pusat Bantuan', icon: <HelpCircle size={16} />, label: 'Bantuan', desc: 'Panduan Bantuan & Layanan Bantuan' }
  ]

  const activeMeta = tabMeta.find(t => t.id === activeTab)

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
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white text-left font-sans animate-in fade-in duration-300">

      {/* Header Halaman */}
      <div className="hidden md:flex border-b border-neutral-800 pb-4 flex-row justify-between items-center gap-4 text-left">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            Page <span className="text-yellow-500">Manager</span>
          </h1>
          <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider uppercase">Kelola dan kustomisasi konten informasi dinamis untuk portal utama</p>
        </div>
        <button 
          onClick={handleUpdateConfig} 
          disabled={isSaving} 
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 cursor-pointer"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} Simpan Semua Perubahan
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="flex md:grid md:grid-cols-4 gap-2 md:gap-3 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
        {tabMeta.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 p-2.5 md:p-4 rounded-xl md:rounded-2xl border text-left transition-all duration-300 relative group cursor-pointer ${
                isActive 
                  ? 'border-yellow-500/40 bg-yellow-500/[0.03] shadow-[0_4px_20px_rgba(234,179,8,0.05)]' 
                  : 'border-neutral-800 bg-neutral-950/20 hover:border-neutral-700/50'
              }`}
            >
              {isActive && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[2px] bg-yellow-500" />
              )}
              <div className="flex items-center gap-2">
                <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-colors duration-300 ${isActive ? 'bg-yellow-500 text-black' : 'bg-neutral-900 text-neutral-400 group-hover:text-yellow-500'}`}>
                  {tab.icon}
                </div>
                <div className="min-w-0">
                  <p className={`text-[10px] md:text-xs font-black uppercase tracking-wide leading-none ${isActive ? 'text-white' : 'text-neutral-400 group-hover:text-white'}`}>{tab.label}</p>
                  <p className="text-[8px] md:text-[9px] text-neutral-500 font-bold truncate mt-0.5 md:mt-1 leading-none hidden md:block">{tab.desc}</p>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Editor + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Editor Area */}
        <PageEditor 
          title={activeMeta?.name || 'Halaman'}
          value={textValue}
          onChange={(val) => setConfig({ ...config, [activeKey]: val })}
          isSaving={isSaving}
          onSave={handleUpdateConfig}
        />

        {/* Live Preview Area */}
        <PageLivePreview 
          activeTab={activeTab}
          title={activeMeta?.name || 'Halaman'}
          value={textValue}
        />

      </div>

    </div>
  )
}
