'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface ManualPaymentSettingsFormProps {
  initialBankName: string
  initialAccountNumber: string
  initialAccountName: string
}

export default function ManualPaymentSettingsForm({
  initialBankName,
  initialAccountNumber,
  initialAccountName
}: ManualPaymentSettingsFormProps) {
  const { showAlert } = useModal()
  // State untuk nama bank manual
  const [manualBankName, setManualBankName] = useState(initialBankName)
  // State untuk nomor rekening manual
  const [manualAccountNumber, setManualAccountNumber] = useState(initialAccountNumber)
  // State untuk nama pemilik rekening manual
  const [manualAccountName, setManualAccountName] = useState(initialAccountName)
  // State loading penyimpanan
  const [savingManualPayment, setSavingManualPayment] = useState(false)

  const handleSaveManualPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingManualPayment(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateManualPaymentSettings',
          manualBankName,
          manualAccountNumber,
          manualAccountName
        })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan rekening manual')
      
      showAlert({
        title: 'Berhasil',
        message: 'Pengaturan rekening manual berhasil disimpan!',
        type: 'success'
      })
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Gagal',
        message: error.message || 'Terjadi kesalahan saat menyimpan.',
        type: 'danger'
      })
    } finally {
      setSavingManualPayment(false)
    }
  }

  return (
    <form onSubmit={handleSaveManualPayment} className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg text-left">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 block">Nama Bank</label>
          <input 
            type="text" 
            placeholder="Contoh: Bank Central Asia (BCA)" 
            value={manualBankName} 
            onChange={(e) => setManualBankName(e.target.value)}
            className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 block">Atas Nama (Pemilik Rekening)</label>
          <input 
            type="text" 
            placeholder="Contoh: Muhammad Rasyiq" 
            value={manualAccountName} 
            onChange={(e) => setManualAccountName(e.target.value)}
            className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
            required
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-400 block">Nomor Rekening</label>
          <input 
            type="text" 
            placeholder="Contoh: 1234567890" 
            value={manualAccountNumber} 
            onChange={(e) => setManualAccountNumber(e.target.value)}
            className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
            required
          />
        </div>
      </div>
      <div className="flex justify-end pt-2">
        <button 
          type="submit"
          disabled={savingManualPayment}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98]"
        >
          {savingManualPayment ? (
            <>
              <RefreshCw size={12} className="animate-spin" /> Menyimpan...
            </>
          ) : (
            'Simpan Rekening Manual'
          )}
        </button>
      </div>
    </form>
  )
}
