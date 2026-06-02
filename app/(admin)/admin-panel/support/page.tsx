'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import {
  Save, Plus, Trash2, MessageSquare,
  RefreshCw, HelpCircle, X
} from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

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
  const [isSaving, setIsSaving] = useState(false)
  const isMounted = useRef(true)

  const [showFaqModal, setShowFaqModal] = useState(false)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', sort_order: 0 })

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
          message: data.error || 'Gagal update config',
          type: 'danger'
        })
      } else {
        showAlert({
          title: 'Berhasil',
          message: 'Kontak Support Berhasil Diperbarui!',
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

  const handleAddFaq = async () => {
    if (!newFaq.question || !newFaq.answer) return
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addFaq', faq: newFaq })
      })
      const data = await res.json()
      if (res.ok) {
        setShowFaqModal(false)
        setNewFaq({ question: '', answer: '', sort_order: 0 })
        fetchData()
      } else {
        showAlert({
          title: 'Gagal Menyimpan',
          message: data.error || 'Gagal menyimpan FAQ',
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
    } finally {
      setIsSaving(false)
    }
  }

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

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-transparent">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white text-left font-sans animate-in fade-in duration-300">

      {/* Title */}
      <div className="border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black tracking-tight text-white">Support <span className="text-yellow-500">Manager</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Kelola kontak bantuan operasional WhatsApp, Telegram, email, dan FAQ member</p>
      </div>

      {/* SECTION KONTAK */}
      <div className="space-y-4">
        <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1 flex items-center gap-2">
          <MessageSquare size={14} className="text-yellow-500" /> Kontak Support
        </h3>
        <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1">WhatsApp</label>
            <input type="text" value={config.whatsapp_number} onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })} className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1">Telegram</label>
            <input type="text" value={config.telegram_link} onChange={(e) => setConfig({ ...config, telegram_link: e.target.value })} className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1">Email</label>
            <input type="text" value={config.support_email} onChange={(e) => setConfig({ ...config, support_email: e.target.value })} className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1">Operasional</label>
            <input type="text" value={config.operational_hours} onChange={(e) => setConfig({ ...config, operational_hours: e.target.value })} className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" />
          </div>
          <button onClick={handleUpdateConfig} disabled={isSaving} className="md:col-span-2 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 cursor-pointer pt-1">
            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} Simpan Perubahan
          </button>
        </div>
      </div>

      {/* SECTION FAQ */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1 flex items-center gap-2">
            <HelpCircle size={14} className="text-yellow-500" /> FAQ Member
          </h3>
          <button onClick={() => setShowFaqModal(true)} className="bg-yellow-500/5 text-yellow-500 px-3.5 py-2 rounded-xl border border-yellow-500/15 text-[10px] font-black tracking-widest hover:bg-yellow-500 hover:text-black transition-all duration-300 cursor-pointer"><Plus size={12} className="inline mr-1" /> Tambah</button>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-5 bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl flex justify-between items-start hover:border-neutral-700/50 shadow-lg transition-all duration-300 group">
              <div className="text-left min-w-0 pr-4">
                <p className="text-xs font-bold text-white group-hover:text-yellow-500 transition-all duration-300 font-sans">{faq.question}</p>
                <p className="text-[10px] text-neutral-500 font-bold mt-1.5 leading-relaxed tracking-wider">{faq.answer}</p>
              </div>
              <button onClick={() => handleDeleteFaq(faq.id)} className="p-2 bg-neutral-900/60 border border-neutral-800 hover:border-red-500/30 hover:text-red-400 rounded-xl text-neutral-600 transition-all duration-300 cursor-pointer shrink-0"><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setShowFaqModal(false)} />

          <div className="relative w-full max-w-md bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/50">
              <h3 className="text-xs font-black tracking-wider text-white">Tambah FAQ</h3>
              <button
                onClick={() => setShowFaqModal(false)}
                className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Pertanyaan</label>
                <input type="text" placeholder="Masukkan pertanyaan..." value={newFaq.question} onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Jawaban</label>
                <textarea placeholder="Masukkan jawaban..." value={newFaq.answer} onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600 min-h-20" />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Sort Order</label>
                <input type="number" placeholder="0" value={newFaq.sort_order} onChange={(e) => setNewFaq({ ...newFaq, sort_order: Number(e.target.value) })} className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" />
              </div>

              <button onClick={handleAddFaq} className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98] pt-1">
                Simpan FAQ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}