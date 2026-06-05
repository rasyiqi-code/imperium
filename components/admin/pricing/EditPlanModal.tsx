'use client'

import React, { useState } from 'react'
import { X, RefreshCw, Save } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'
import { PaketVIP } from '@/lib/types'

interface EditPlanModalProps {
  plan: PaketVIP | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function EditPlanModal({ plan, isOpen, onClose, onSuccess }: EditPlanModalProps) {
  const { showAlert } = useModal()
  const [saving, setSaving] = useState(false)
  
  // State lokal diinisialisasi langsung dari properti plan saat mounting
  const [editData, setEditData] = useState<PaketVIP | null>(plan)

  // Tangani penyimpanan perubahan data paket

  const handleUpdate = async () => {
    if (!editData) return
    
    if (!editData.nama_paket.trim()) {
      showAlert({
        title: 'Nama Paket Kosong',
        message: 'Nama paket wajib diisi!',
        type: 'warning'
      })
      return
    }
    if (editData.harga < 0) {
      showAlert({
        title: 'Harga Tidak Valid',
        message: 'Harga harus bernilai positif!',
        type: 'warning'
      })
      return
    }
    if (editData.durasi_hari <= 0) {
      showAlert({
        title: 'Durasi Tidak Valid',
        message: 'Durasi hari harus lebih dari 0!',
        type: 'warning'
      })
      return
    }
    
    setSaving(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePricingPlan',
          planId: editData.id,
          nama_paket: editData.nama_paket,
          harga: editData.harga,
          durasi_hari: editData.durasi_hari,
          fitur: editData.fitur,
          recommended: editData.recommended
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah paket pricing')
      
      onSuccess()
      onClose()
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Error',
        message: `Gagal: ${error.message}`,
        type: 'danger'
      })
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen || !editData) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/50">
          <h3 className="text-xs font-black tracking-wider text-white">Edit Pricing Plan</h3>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-neutral-500 hover:text-white transition-all flex items-center justify-center cursor-pointer"
          >
            <X size={14}/>
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Nama Paket</label>
            <input 
              type="text" 
              value={editData.nama_paket} 
              onChange={e => setEditData({...editData, nama_paket: e.target.value})}
              className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Harga (Rp)</label>
              <input 
                type="number" 
                value={editData.harga} 
                onChange={e => setEditData({...editData, harga: Number(e.target.value)})}
                className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Durasi (Hari)</label>
              <input 
                type="number" 
                value={editData.durasi_hari} 
                onChange={e => setEditData({...editData, durasi_hari: Number(e.target.value)})}
                className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-1">
            <input 
              type="checkbox" 
              id="edit-recommended"
              checked={editData.recommended || false} 
              onChange={e => setEditData({...editData, recommended: e.target.checked})}
              className="w-4 h-4 rounded border-neutral-800 text-yellow-500 focus:ring-yellow-500/50 bg-neutral-900 accent-yellow-500 cursor-pointer"
            />
            <label htmlFor="edit-recommended" className="text-[10px] font-bold text-neutral-300 tracking-widest cursor-pointer select-none">Rekomendasikan Paket Ini</label>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Fitur (Pisahkan dengan koma)</label>
            <textarea 
              rows={3}
              value={editData.fitur?.join(', ') || ''} 
              onChange={e => setEditData({...editData, fitur: e.target.value.split(',').map(f => f.trim())})}
              className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600 min-h-20"
              placeholder="Contoh: Sinyal VIP, Mentorship"
            />
          </div>

          <button 
            onClick={handleUpdate}
            disabled={saving}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98]"
          >
            {saving ? <RefreshCw className="animate-spin" size={14}/> : <Save size={14}/>} Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  )
}
