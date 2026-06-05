'use client'

import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface UpdateEmailFormProps {
  currentEmail: string
  onClose: () => void
  onUpdateEmail: (newEmail: string) => Promise<boolean>
}

export default function UpdateEmailForm({ currentEmail, onClose, onUpdateEmail }: UpdateEmailFormProps) {
  const { showAlert } = useModal()
  const [newEmail, setNewEmail] = useState(currentEmail)
  const [updating, setUpdating] = useState(false)

  const handleSubmit = async () => {
    if (!newEmail) {
      showAlert({
        title: 'Email Kosong',
        message: 'Email baru tidak boleh kosong!',
        type: 'warning'
      })
      return
    }

    if (newEmail === currentEmail) {
      onClose()
      return
    }

    setUpdating(true)
    const success = await onUpdateEmail(newEmail)
    setUpdating(false)

    if (success) {
      onClose()
    }
  }

  return (
    <div className="p-4 bg-neutral-900/25 border border-neutral-900 rounded-2xl m-3 space-y-3.5 animate-in zoom-in-95 duration-200 text-left">
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Email Baru</label>
        <input
          type="email"
          placeholder="Masukkan email baru..."
          className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-2.5 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          disabled={updating}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-3 mt-1">
        <button
          onClick={onClose}
          disabled={updating}
          className="w-full bg-neutral-900 border border-neutral-855 hover:bg-neutral-800 text-neutral-400 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer text-center"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={updating || !newEmail || newEmail === currentEmail}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-855 text-black disabled:text-neutral-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer disabled:cursor-not-allowed text-center flex items-center justify-center gap-1.5"
        >
          {updating ? <RefreshCw className="animate-spin" size={12} /> : 'Simpan'}
        </button>
      </div>
    </div>
  )
}
