'use client'

import React, { useState } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface AddFaqModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function AddFaqModal({ isOpen, onClose, onSuccess }: AddFaqModalProps) {
  const { showAlert } = useModal()
  const [isSaving, setIsSaving] = useState(false)
  const [newFaq, setNewFaq] = useState({ question: '', answer: '', sort_order: 0 })

  // Tangani penyimpanan FAQ baru
  const handleAddFaq = async () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      showAlert({
        title: 'Formulir Belum Lengkap',
        message: 'Pertanyaan dan jawaban wajib diisi!',
        type: 'warning'
      })
      return
    }
    setIsSaving(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addFaq', faq: newFaq })
      })
      const data = await res.json()
      if (res.ok) {
        setNewFaq({ question: '', answer: '', sort_order: 0 })
        onSuccess()
        onClose()
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />

      <div className="relative w-full max-w-md bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/50">
          <h3 className="text-xs font-black tracking-wider text-white">Tambah FAQ</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Pertanyaan</label>
            <input 
              type="text" 
              placeholder="Masukkan pertanyaan..." 
              value={newFaq.question} 
              onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })} 
              className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Jawaban</label>
            <textarea 
              placeholder="Masukkan jawaban..." 
              value={newFaq.answer} 
              onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })} 
              className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600 min-h-20" 
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Sort Order</label>
            <input 
              type="number" 
              placeholder="0" 
              value={newFaq.sort_order} 
              onChange={(e) => setNewFaq({ ...newFaq, sort_order: Number(e.target.value) })} 
              className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" 
            />
          </div>

          <button 
            onClick={handleAddFaq} 
            disabled={isSaving}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98]"
          >
            {isSaving ? <RefreshCw className="animate-spin" size={14} /> : null} Simpan FAQ
          </button>
        </div>
      </div>
    </div>
  )
}
