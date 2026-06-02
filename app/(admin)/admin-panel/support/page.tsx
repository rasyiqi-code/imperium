'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
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
      const resConfig = await supabase.from('support_config').select('*').eq('id', 1).maybeSingle()
      const resFaqs = await supabase.from('support_faqs').select('*').order('sort_order', { ascending: true })
      
      if (resConfig.data) setConfig(resConfig.data)
      if (resFaqs.data) setFaqs(resFaqs.data as FAQ[])
    } catch (err) {
      console.error(err)
    } finally {
      if (isMounted.current) setLoading(false)
    }
  }, [])

  useEffect(() => {
    isMounted.current = true
    fetchData()
    return () => { isMounted.current = false }
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
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: `Gagal: ${err.message}`,
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
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: `Gagal: ${err.message}`,
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
        } catch (err: any) {
          showAlert({
            title: 'Error',
            message: `Gagal: ${err.message}`,
            type: 'danger'
          })
        }
      }
    })
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-4xl mx-auto pb-32 bg-black min-h-screen text-white text-left">
      {/* SECTION KONTAK */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-neutral-500 uppercase px-1 flex items-center gap-2">
          <MessageSquare size={14} /> Kontak Support
        </h3>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">WhatsApp</label>
            <input type="text" value={config.whatsapp_number} onChange={(e) => setConfig({...config, whatsapp_number: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">Telegram</label>
            <input type="text" value={config.telegram_link} onChange={(e) => setConfig({...config, telegram_link: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">Email</label>
            <input type="text" value={config.support_email} onChange={(e) => setConfig({...config, support_email: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 uppercase">Operasional</label>
            <input type="text" value={config.operational_hours} onChange={(e) => setConfig({...config, operational_hours: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs outline-none focus:border-yellow-500 text-white" />
          </div>
          <button onClick={handleUpdateConfig} disabled={isSaving} className="md:col-span-2 py-3 bg-yellow-500 text-black rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2">
            {isSaving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Simpan Perubahan
          </button>
        </div>
      </div>

      {/* SECTION FAQ */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-bold text-neutral-500 uppercase px-1 flex items-center gap-2">
            <HelpCircle size={14} /> FAQ Member
          </h3>
          <button onClick={() => setShowFaqModal(true)} className="bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-lg border border-yellow-500/20 text-[10px] font-bold uppercase"><Plus size={14} className="inline mr-1" /> Tambah</button>
        </div>
        <div className="space-y-3">
          {faqs.map((faq) => (
            <div key={faq.id} className="p-4 bg-neutral-900 border border-neutral-800 rounded-xl flex justify-between">
              <div className="text-left">
                <p className="text-xs font-bold text-white uppercase">{faq.question}</p>
                <p className="text-[10px] text-neutral-500 uppercase mt-1">{faq.answer}</p>
              </div>
              <button onClick={() => handleDeleteFaq(faq.id)} className="text-neutral-700 hover:text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {showFaqModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-neutral-800 pb-3">
              <p className="text-xs font-bold uppercase">Tambah FAQ</p>
              <button onClick={() => setShowFaqModal(false)}><X size={18}/></button>
            </div>
            <input type="text" placeholder="Pertanyaan" value={newFaq.question} onChange={(e) => setNewFaq({...newFaq, question: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white" />
            <textarea placeholder="Jawaban" value={newFaq.answer} onChange={(e) => setNewFaq({...newFaq, answer: e.target.value})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white min-h-20" />
            <input type="number" placeholder="Sort Order" value={newFaq.sort_order} onChange={(e) => setNewFaq({...newFaq, sort_order: Number(e.target.value)})} className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs text-white" />
            <button onClick={handleAddFaq} className="w-full py-3 bg-yellow-500 text-black rounded-xl text-xs font-bold uppercase">Simpan</button>
          </div>
        </div>
      )}
    </div>
  )
}