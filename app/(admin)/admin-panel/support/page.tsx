'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { Plus, Trash2, HelpCircle } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'
import Loader from '@/components/Loader'
import SupportContactForm from '@/components/admin/support/SupportContactForm'
import AddFaqModal from '@/components/admin/support/AddFaqModal'

interface SupportConfig {
  whatsapp_number: string
  telegram_link: string
  support_email: string
  operational_hours: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  sort_order: number
}

export default function AdminSupportManager() {
  const { showAlert, showConfirm } = useModal()
  const [config, setConfig] = useState<SupportConfig>({
    whatsapp_number: '',
    telegram_link: '',
    support_email: '',
    operational_hours: ''
  })
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showFaqModal, setShowFaqModal] = useState(false)
  const isMounted = useRef(true)

  // Ambil data kontak support dan FAQ dari API
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
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil data support')
      if (isMounted.current) {
        if (data.config) setConfig(data.config)
        if (data.faqs) setFaqs(data.faqs as FAQ[])
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

  // Tangani penghapusan FAQ
  const handleDeleteFaq = async (id: string) => {
    showConfirm({
      title: 'Hapus FAQ',
      message: 'Hapus FAQ ini secara permanen?',
      type: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteFaq', faqId: id })
          })
          const data = await res.json()
          if (res.ok) {
            fetchData()
          } else {
            showAlert({
              title: 'Gagal Menghapus',
              message: data.error || 'Gagal menghapus FAQ',
              type: 'danger'
            })
          }
        } catch (err: unknown) {
          const error = err as Error
          showAlert({
            title: 'Error',
            message: `Gagal: ${error.message}`,
            type: 'danger'
          })
        }
      }
    })
  }

  if (loading) return <Loader label="Memuat Layanan Bantuan..." />

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white text-left font-sans animate-in fade-in duration-300">

      {/* Title */}
      <div className="border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">Support <span className="text-yellow-500">Manager</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Kelola kontak bantuan operasional WhatsApp, Telegram, email, dan FAQ member</p>
      </div>

      {/* SECTION KONTAK */}
      <SupportContactForm 
        key={config.whatsapp_number || 'none'}
        initialConfig={config} 
        onSuccess={fetchData}
      />

      {/* SECTION FAQ */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1 flex items-center gap-2">
            <HelpCircle size={14} className="text-yellow-500" /> FAQ Member
          </h3>
          <button 
            onClick={() => setShowFaqModal(true)} 
            className="bg-yellow-500/5 text-yellow-500 px-3.5 py-2 rounded-xl border border-yellow-500/15 text-[10px] font-black tracking-widest hover:bg-yellow-500 hover:text-black transition-all duration-300 cursor-pointer"
          >
            <Plus size={12} className="inline mr-1" /> Tambah
          </button>
        </div>
        
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-5 bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl flex justify-between items-start hover:border-neutral-700/50 shadow-lg transition-all duration-300 group">
              <div className="text-left min-w-0 pr-4">
                <p className="text-xs font-bold text-white group-hover:text-yellow-500 transition-all duration-300 font-sans">{faq.question}</p>
                <p className="text-[10px] text-neutral-500 font-bold mt-1.5 leading-relaxed tracking-wider">{faq.answer}</p>
              </div>
              <button 
                onClick={() => handleDeleteFaq(faq.id)} 
                className="p-2 bg-neutral-900/60 border border-neutral-800 hover:border-red-500/30 hover:text-red-400 rounded-xl text-neutral-600 transition-all duration-300 cursor-pointer shrink-0"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL TAMBAH FAQ */}
      <AddFaqModal 
        isOpen={showFaqModal} 
        onClose={() => setShowFaqModal(false)} 
        onSuccess={fetchData}
      />
    </div>
  )
}