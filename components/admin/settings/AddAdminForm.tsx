'use client'

import React, { useState } from 'react'
import { X, RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface AddAdminFormProps {
  onClose: () => void
  onCreateAdmin: (email: string, pass: string, name: string, wa: string) => Promise<boolean>
}

export default function AddAdminForm({ onClose, onCreateAdmin }: AddAdminFormProps) {
  const { showAlert } = useModal()
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminWa, setNewAdminWa] = useState('')
  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleSubmit = async () => {
    if (!newAdminEmail || !newAdminPassword || !newAdminName) {
      showAlert({
        title: 'Formulir Belum Lengkap',
        message: 'Email, password, dan nama lengkap wajib diisi!',
        type: 'warning'
      })
      return
    }

    if (newAdminPassword.length < 6) {
      showAlert({
        title: 'Password Terlalu Pendek',
        message: 'Password harus minimal 6 karakter.',
        type: 'warning'
      })
      return
    }

    setIsProcessing(true)
    const success = await onCreateAdmin(newAdminEmail, newAdminPassword, newAdminName, newAdminWa)
    setIsProcessing(false)

    if (success) {
      setNewAdminEmail('')
      setNewAdminPassword('')
      setNewAdminName('')
      setNewAdminWa('')
      onClose()
    }
  }

  return (
    <div className="p-5 rounded-2xl bg-neutral-950/30 backdrop-blur-md border border-neutral-800 shadow-lg space-y-4 animate-in zoom-in-95 duration-200 text-left">
      <div className="flex justify-between items-center pb-2 border-b border-neutral-900">
        <h3 className="text-xs font-black text-white uppercase tracking-wider">Tambah Administrator Baru</h3>
        <button 
          onClick={onClose}
          disabled={isProcessing}
          className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
        >
          <X size={16} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Nama Lengkap</label>
          <input
            type="text"
            placeholder="Nama admin baru..."
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-2.5 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all"
            value={newAdminName}
            onChange={(e) => setNewAdminName(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Nomor WhatsApp</label>
          <input
            type="tel"
            placeholder="0812..."
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-2.5 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all"
            value={newAdminWa}
            onChange={(e) => setNewAdminWa(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Email Address</label>
          <input
            type="email"
            placeholder="email@imperium.com"
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-2.5 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all"
            value={newAdminEmail}
            onChange={(e) => setNewAdminEmail(e.target.value)}
            disabled={isProcessing}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Password</label>
          <input
            type="password"
            placeholder="Password (Min. 6 karakter)..."
            className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-2.5 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all font-mono"
            value={newAdminPassword}
            onChange={(e) => setNewAdminPassword(e.target.value)}
            disabled={isProcessing}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="px-4 py-2 bg-neutral-900 border border-neutral-855 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer"
        >
          Batal
        </button>
        <button
          onClick={handleSubmit}
          disabled={isProcessing || !newAdminEmail || !newAdminPassword || !newAdminName}
          className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-850 text-black disabled:text-neutral-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
        >
          {isProcessing ? <RefreshCw className="animate-spin" size={12} /> : 'Buat Admin'}
        </button>
      </div>
    </div>
  )
}
