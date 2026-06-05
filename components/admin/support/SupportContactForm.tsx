'use client'

import React, { useState } from 'react'
import { MessageSquare, Save, RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface SupportConfig {
  whatsapp_number: string
  telegram_link: string
  support_email: string
  operational_hours: string
}

interface SupportContactFormProps {
  initialConfig: SupportConfig
  onSuccess?: () => void
}

export default function SupportContactForm({ initialConfig, onSuccess }: SupportContactFormProps) {
  const { showAlert } = useModal()
  const [config, setConfig] = useState<SupportConfig>({ ...initialConfig })
  const [isSaving, setIsSaving] = useState(false)

  // Tangani pembaruan kontak operasional
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
        if (onSuccess) onSuccess()
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

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1 flex items-center gap-2 text-left">
        <MessageSquare size={14} className="text-yellow-500" /> Kontak Support
      </h3>
      <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800/80 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-2 gap-4 shadow-lg text-left">
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1">WhatsApp</label>
          <input 
            type="text" 
            value={config.whatsapp_number} 
            onChange={(e) => setConfig({ ...config, whatsapp_number: e.target.value })} 
            className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1">Telegram</label>
          <input 
            type="text" 
            value={config.telegram_link} 
            onChange={(e) => setConfig({ ...config, telegram_link: e.target.value })} 
            className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1">Email</label>
          <input 
            type="text" 
            value={config.support_email} 
            onChange={(e) => setConfig({ ...config, support_email: e.target.value })} 
            className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" 
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-bold text-neutral-500 tracking-wider ml-1">Operasional</label>
          <input 
            type="text" 
            value={config.operational_hours} 
            onChange={(e) => setConfig({ ...config, operational_hours: e.target.value })} 
            className="w-full bg-neutral-900/20 border border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 transition-all duration-300 rounded-xl p-3.5 text-xs font-bold outline-none text-white placeholder-neutral-600" 
          />
        </div>
        <button 
          onClick={handleUpdateConfig} 
          disabled={isSaving} 
          className="md:col-span-2 py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black rounded-xl text-[10px] font-black tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all duration-300 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 cursor-pointer"
        >
          {isSaving ? <RefreshCw className="animate-spin" size={14} /> : <Save size={14} />} Simpan Perubahan
        </button>
      </div>
    </div>
  )
}
