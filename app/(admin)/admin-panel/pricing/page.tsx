'use client'

import { useEffect, useState, useCallback } from 'react'
import { 
  RefreshCw, 
  Edit3, 
  CheckCircle2, 
  Save, 
  X,
  Package,
  Plus
} from 'lucide-react'
import { PaketVIP } from '@/lib/types'
import { useModal } from '@/components/ModalProvider'
import Loader from '@/components/Loader'

export default function PricingEditor() {
  const { showAlert } = useModal()
  const [plans, setPlans] = useState<PaketVIP[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<PaketVIP | null>(null)
  const [saving, setSaving] = useState(false)
  
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPlan, setNewPlan] = useState<Omit<PaketVIP, 'id'>>({
    nama_paket: '',
    harga: 0,
    durasi_hari: 30,
    fitur: []
  })
  const [creating, setCreating] = useState(false)

  const handleCreate = async () => {
    if (!newPlan.nama_paket.trim()) {
      showAlert({
        title: 'Nama Paket Kosong',
        message: 'Nama paket wajib diisi!',
        type: 'warning'
      })
      return
    }
    if (newPlan.harga < 0) {
      showAlert({
        title: 'Harga Tidak Valid',
        message: 'Harga harus bernilai positif!',
        type: 'warning'
      })
      return
    }
    if (newPlan.durasi_hari <= 0) {
      showAlert({
        title: 'Durasi Tidak Valid',
        message: 'Durasi hari harus lebih dari 0!',
        type: 'warning'
      })
      return
    }
    setCreating(true)
    
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createPricingPlan',
          nama_paket: newPlan.nama_paket,
          harga: newPlan.harga,
          durasi_hari: newPlan.durasi_hari,
          fitur: newPlan.fitur
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal membuat paket pricing baru')
      
      setShowAddModal(false)
      setNewPlan({
        nama_paket: '',
        harga: 0,
        durasi_hari: 30,
        fitur: []
      })
      const updatedPlans = await fetchPlans()
      setPlans(updatedPlans)
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Error',
        message: `Gagal: ${error.message}`,
        type: 'danger'
      })
    } finally {
      setCreating(false)
    }
  }

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getPricingPlans' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengambil paket pricing')
      return (data.plans as PaketVIP[]) || []
    } catch (err: unknown) {
      console.error('Error fetching pricing plans:', err)
      return []
    }
  }, [])

  useEffect(() => { 
    let active = true
    const load = async () => {
      setLoading(true)
      const data = await fetchPlans()
      if (!active) return
      setPlans(data)
      setLoading(false)
    }
    const timer = setTimeout(load, 0)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [fetchPlans])

  const handleUpdate = async () => {
    if (!editModal) return
    setSaving(true)
    
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updatePricingPlan',
          planId: editModal.id,
          nama_paket: editModal.nama_paket,
          harga: editModal.harga,
          durasi_hari: editModal.durasi_hari,
          fitur: editModal.fitur
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal mengubah paket pricing')
      
      setEditModal(null)
      const updatedPlans = await fetchPlans()
      setPlans(updatedPlans)
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

  if (loading) return <Loader label="Memuat Konfigurasi Harga..." />

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 max-w-7xl mx-auto pb-32 bg-transparent text-white text-left font-sans animate-in fade-in duration-300">
      
      {/* Header Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-4 mb-6">
        <div className="hidden md:block">
          <h1 className="text-xl font-black uppercase tracking-tight text-white">Pricing <span className="text-yellow-500">Editor</span></h1>
          <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Atur paket membership VIP Imperium Crypto</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="w-full sm:w-auto py-3 px-5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-yellow-500/15 cursor-pointer duration-300"
        >
          <Plus size={14} /> Tambah Paket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="p-6 rounded-2xl bg-neutral-950/30 backdrop-blur-md border border-neutral-800 hover:border-yellow-500/30 shadow-lg hover:shadow-yellow-500/2 transition-all duration-300 group relative overflow-hidden flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4">
                <div className="h-10 w-10 bg-yellow-500/5 border border-yellow-500/15 rounded-xl flex items-center justify-center text-yellow-500 group-hover:scale-105 transition-transform duration-300">
                  <Package size={18} />
                </div>
                <button 
                  onClick={() => setEditModal(plan)}
                  className="p-2 bg-neutral-900 border border-neutral-800 hover:border-yellow-500/30 hover:text-yellow-500 rounded-xl transition-all duration-300 cursor-pointer"
                >
                  <Edit3 size={14} />
                </button>
              </div>

              <h3 className="text-base font-black uppercase tracking-tight text-white">{plan.nama_paket}</h3>
              <p className="text-lg font-black text-yellow-500 mt-1 uppercase tracking-tight">
                Rp {plan.harga.toLocaleString('id-ID')} <span className="text-[10px] text-neutral-500 font-bold tracking-widest">/ {plan.durasi_hari} HARI</span>
              </p>
            </div>

            <div className="mt-6 space-y-3 pt-6 border-t border-neutral-900/60">
              {plan.fitur && plan.fitur.length > 0 ? plan.fitur.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-[10px] font-black text-neutral-400 tracking-wide">
                  <CheckCircle2 size={12} className="text-yellow-500 shrink-0" /> {feat}
                </div>
              )) : (
                <p className="text-[10px] text-neutral-600 font-bold tracking-widest">Belum ada fitur</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDIT */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setEditModal(null)} />
          
          <div className="relative w-full max-w-md bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/50">
              <h3 className="text-xs font-black tracking-wider text-white">Edit Pricing Plan</h3>
              <button 
                onClick={() => setEditModal(null)} 
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
                  value={editModal.nama_paket} 
                  onChange={e => setEditModal({...editModal, nama_paket: e.target.value})}
                  className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600"
                />
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Harga (Rp)</label>
                  <input 
                    type="number" 
                    value={editModal.harga} 
                    onChange={e => setEditModal({...editModal, harga: Number(e.target.value)})}
                    className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Durasi (Hari)</label>
                  <input 
                    type="number" 
                    value={editModal.durasi_hari} 
                    onChange={e => setEditModal({...editModal, durasi_hari: Number(e.target.value)})}
                    className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600"
                  />
                </div>
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Fitur (Pisahkan dengan koma)</label>
                <textarea 
                  rows={3}
                  value={editModal.fitur?.join(', ') || ''} 
                  onChange={e => setEditModal({...editModal, fitur: e.target.value.split(',').map(f => f.trim())})}
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
      )}

      {/* MODAL TAMBAH */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 text-left">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          
          <div className="relative w-full max-w-md bg-neutral-950/80 backdrop-blur-md border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-neutral-900 flex justify-between items-center bg-neutral-950/50">
              <h3 className="text-xs font-black tracking-wider text-white">Tambah Paket Pricing Baru</h3>
              <button 
                onClick={() => setShowAddModal(false)} 
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
                  value={newPlan.nama_paket} 
                  onChange={e => setNewPlan({...newPlan, nama_paket: e.target.value})}
                  className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600"
                  placeholder="Contoh: Paket 3 Bulan"
                />
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Harga (Rp)</label>
                  <input 
                    type="number" 
                    value={newPlan.harga} 
                    onChange={e => setNewPlan({...newPlan, harga: Number(e.target.value)})}
                    className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600"
                    placeholder="299000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Durasi (Hari)</label>
                  <input 
                    type="number" 
                    value={newPlan.durasi_hari} 
                    onChange={e => setNewPlan({...newPlan, durasi_hari: Number(e.target.value)})}
                    className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600"
                    placeholder="90"
                  />
                </div>
              </div>
 
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-500 tracking-widest ml-1">Fitur (Pisahkan dengan koma)</label>
                <textarea 
                  rows={3}
                  value={newPlan.fitur?.join(', ') || ''} 
                  onChange={e => setNewPlan({...newPlan, fitur: e.target.value.split(',').map(f => f.trim())})}
                  className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3 text-xs font-bold outline-none text-white placeholder-neutral-600 min-h-20"
                  placeholder="Sinyal VIP, Mentorship, Akademi Crypto"
                />
              </div>
 
              <button 
                onClick={handleCreate}
                disabled={creating}
                className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98]"
              >
                {creating ? <RefreshCw className="animate-spin" size={14}/> : <Plus size={14}/>} Simpan Paket Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}