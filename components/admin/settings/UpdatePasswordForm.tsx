'use client'

import React, { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface UpdatePasswordFormProps {
  onClose: () => void
  onUpdatePassword: (newPass: string) => Promise<boolean>
}

export default function UpdatePasswordForm({ onClose, onUpdatePassword }: UpdatePasswordFormProps) {
  const { showAlert } = useModal()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updating, setUpdating] = useState(false)

  const handleSubmit = async () => {
    if (newPassword.length < 6) {
      showAlert({
        title: 'Password Terlalu Pendek',
        message: 'Password baru harus minimal 6 karakter.',
        type: 'warning'
      })
      return
    }
    if (newPassword !== confirmPassword) {
      showAlert({
        title: 'Password Tidak Cocok',
        message: 'Konfirmasi password tidak cocok dengan password baru.',
        type: 'warning'
      })
      return
    }

    setUpdating(true)
    const success = await onUpdatePassword(newPassword)
    setUpdating(false)

    if (success) {
      setNewPassword('')
      setConfirmPassword('')
      onClose()
    }
  }

  return (
    <div className="p-4 bg-neutral-900/25 border border-neutral-900 rounded-2xl m-3 space-y-3.5 animate-in zoom-in-95 duration-200 text-left">
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Password Baru</label>
        <input
          type="password"
          placeholder="Masukkan password baru (Min. 6 karakter)..."
          className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-2.5 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all font-mono"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          disabled={updating}
        />
      </div>
      <div className="space-y-1">
        <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Konfirmasi Password Baru</label>
        <input
          type="password"
          placeholder="Ulangi password baru..."
          className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-2.5 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all font-mono"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
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
          disabled={updating || newPassword.length < 6 || confirmPassword.length < 6}
          className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-855 text-black disabled:text-neutral-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer disabled:cursor-not-allowed text-center flex items-center justify-center gap-1.5"
        >
          {updating ? <RefreshCw className="animate-spin" size={12} /> : 'Simpan'}
        </button>
      </div>
    </div>
  )
}
