'use client'

import { useEffect, useState, useCallback } from 'react'
import { Edit3, CheckCircle2, Package, Plus } from 'lucide-react'
import { PaketVIP } from '@/lib/types'
import Loader from '@/components/Loader'
import AddPlanModal from '@/components/admin/pricing/AddPlanModal'
import EditPlanModal from '@/components/admin/pricing/EditPlanModal'

export default function PricingEditor() {
  const [plans, setPlans] = useState<PaketVIP[]>([])
  const [loading, setLoading] = useState(true)
  const [editModal, setEditModal] = useState<PaketVIP | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)

  // Ambil paket VIP dari database
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

      {/* Grid Paket */}
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

              <div className="flex items-center gap-2">
                <h3 className="text-base font-black uppercase tracking-tight text-white">{plan.nama_paket}</h3>
                {plan.recommended && (
                  <span className="px-2 py-0.5 bg-yellow-500 text-black text-[8px] font-black uppercase rounded tracking-widest">Recom</span>
                )}
              </div>
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

      {/* Modal Tambah Paket */}
      <AddPlanModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
        onSuccess={async () => {
          const updated = await fetchPlans()
          setPlans(updated)
        }} 
      />

      {/* Modal Edit Paket */}
      <EditPlanModal 
        key={editModal?.id || 'none'}
        plan={editModal} 
        isOpen={!!editModal} 
        onClose={() => setEditModal(null)} 
        onSuccess={async () => {
          const updated = await fetchPlans()
          setPlans(updated)
        }} 
      />
    </div>
  )
}