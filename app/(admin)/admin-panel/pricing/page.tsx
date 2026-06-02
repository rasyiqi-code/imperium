'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
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
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: `Gagal: ${err.message}`,
        type: 'danger'
      })
    } finally {
      setCreating(false)
    }
  }

  const fetchPlans = useCallback(async () => {
    const { data, error } = await supabase
      .from('data_paket_vip')
      .select('*')
      .order('harga', { ascending: true })
    
    if (!error && data) return data as PaketVIP[]
    return []
  }, [])

  useEffect(() => { 
    const load = async () => {
      setLoading(true)
      const data = await fetchPlans()
      setPlans(data)
      setLoading(false)
    }
    load()
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
    } catch (err: any) {
      showAlert({
        title: 'Error',
        message: `Gagal: ${err.message}`,
        type: 'danger'
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <RefreshCw className="animate-spin text-yellow-500" size={32} />
    </div>
  )

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto pb-32 bg-black min-h-screen text-white text-left">
      
      {/* Header Editor */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <h1 className="text-xl font-bold uppercase tracking-tight">Pricing Editor</h1>
          <p className="text-xs text-neutral-500 font-bold uppercase mt-1.5 tracking-tight">Atur paket membership VIP Imperium Crypto</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="sm:self-center py-3 px-6 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-yellow-500/10 cursor-pointer"
        >
          <Plus size={16} /> Tambah Paket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map((plan) => (
          <div key={plan.id} className="p-6 rounded-xl bg-neutral-900 border border-neutral-800 hover:border-yellow-500/30 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="h-10 w-10 bg-yellow-500/10 rounded-xl flex items-center justify-center text-yellow-500">
                <Package size={20} />
              </div>
              <button 
                onClick={() => setEditModal(plan)}
                className="p-2 bg-neutral-800 rounded-xl text-neutral-400 hover:text-yellow-500 border border-neutral-700 transition-all"
              >
                <Edit3 size={16} />
              </button>
            </div>

            <h3 className="text-lg font-bold uppercase tracking-tight">{plan.nama_paket}</h3>
            <p className="text-xl font-bold text-yellow-500 mt-1 uppercase tracking-tight">
              Rp {plan.harga.toLocaleString('id-ID')} <span className="text-xs text-neutral-500 font-medium">/ {plan.durasi_hari} HARI</span>
            </p>

            <div className="mt-6 space-y-3">
              {plan.fitur && plan.fitur.length > 0 ? plan.fitur.map((feat, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase">
                  <CheckCircle2 size={14} className="text-yellow-500" /> {feat}
                </div>
              )) : (
                <p className="text-xs text-neutral-600 uppercase font-medium">Belum ada fitur</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDIT */}
      {editModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden text-left animate-in zoom-in duration-200">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Edit Pricing Plan</h3>
              <button onClick={() => setEditModal(null)} className="text-neutral-500 hover:text-white transition-all"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nama Paket</label>
                <input 
                  type="text" 
                  value={editModal.nama_paket} 
                  onChange={e => setEditModal({...editModal, nama_paket: e.target.value})}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Harga (Rp)</label>
                  <input 
                    type="number" 
                    value={editModal.harga} 
                    onChange={e => setEditModal({...editModal, harga: Number(e.target.value)})}
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-yellow-500 text-white"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Durasi (Hari)</label>
                  <input 
                    type="number" 
                    value={editModal.durasi_hari} 
                    onChange={e => setEditModal({...editModal, durasi_hari: Number(e.target.value)})}
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-yellow-500 text-white"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Fitur (Pisahkan dengan koma)</label>
                <textarea 
                  rows={3}
                  value={editModal.fitur?.join(', ') || ''} 
                  onChange={e => setEditModal({...editModal, fitur: e.target.value.split(',').map(f => f.trim())})}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white"
                  placeholder="CONTOH: SINYAL VIP, MENTORSHIP"
                />
              </div>

              <button 
                onClick={handleUpdate}
                disabled={saving}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
              >
                {saving ? <RefreshCw className="animate-spin" size={16}/> : <Save size={16}/>} Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden text-left animate-in zoom-in duration-200">
            <div className="p-6 border-b border-neutral-800 flex justify-between items-center">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">Tambah Paket Pricing Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-neutral-500 hover:text-white transition-all"><X size={20}/></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Nama Paket</label>
                <input 
                  type="text" 
                  value={newPlan.nama_paket} 
                  onChange={e => setNewPlan({...newPlan, nama_paket: e.target.value})}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white"
                  placeholder="CONTOH: PAKET 3 BULAN"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Harga (Rp)</label>
                  <input 
                    type="number" 
                    value={newPlan.harga} 
                    onChange={e => setNewPlan({...newPlan, harga: Number(e.target.value)})}
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-yellow-500 text-white"
                    placeholder="299000"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Durasi (Hari)</label>
                  <input 
                    type="number" 
                    value={newPlan.durasi_hari} 
                    onChange={e => setNewPlan({...newPlan, durasi_hari: Number(e.target.value)})}
                    className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-yellow-500 text-white"
                    placeholder="90"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Fitur (Pisahkan dengan koma)</label>
                <textarea 
                  rows={3}
                  value={newPlan.fitur?.join(', ') || ''} 
                  onChange={e => setNewPlan({...newPlan, fitur: e.target.value.split(',').map(f => f.trim())})}
                  className="w-full bg-black border border-neutral-800 rounded-xl p-3 text-xs font-bold uppercase outline-none focus:border-yellow-500 text-white"
                  placeholder="SINYAL VIP, MENTORSHIP, AKADEMI CRYPTO"
                />
              </div>

              <button 
                onClick={handleCreate}
                disabled={creating}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3.5 rounded-xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2 cursor-pointer"
              >
                {creating ? <RefreshCw className="animate-spin" size={16}/> : <Plus size={16}/>} Simpan Paket Baru
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}