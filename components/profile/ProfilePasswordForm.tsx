'use client'

import React, { useState } from 'react'
import { Key, RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface ProfilePasswordFormProps {
  onUpdatePassword: (newPassword: string, currentPassword: string) => Promise<boolean>
}

export default function ProfilePasswordForm({ onUpdatePassword }: ProfilePasswordFormProps) {
  const { showAlert } = useModal()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [updating, setUpdating] = useState(false)

  const handleSubmit = async () => {
    if (!currentPassword) {
      showAlert({
        title: 'Input Tidak Lengkap',
        message: 'Password sekarang wajib diisi.',
        type: 'warning'
      })
      return
    }
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
    const success = await onUpdatePassword(newPassword, currentPassword)
    setUpdating(false)

    if (success) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setIsFormOpen(false)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest">Keamanan Akun</h3>
      
      {isFormOpen ? (
        <div className="bg-neutral-950/45 border border-neutral-800/80 rounded-2xl p-4 space-y-3.5 animate-in zoom-in-95 duration-200">
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Password Sekarang</label>
            <input
              type="password"
              placeholder="Masukkan password saat ini..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-3 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all font-mono"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={updating}
            />
          </div>
          <div className="space-y-1">
            <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Password Baru</label>
            <input
              type="password"
              placeholder="Masukkan password baru (Min. 6 karakter)..."
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-3 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all font-mono"
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
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-3 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all font-mono"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={updating}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-1">
            <button
              onClick={() => {
                setIsFormOpen(false)
                setCurrentPassword('')
                setNewPassword('')
                setConfirmPassword('')
              }}
              disabled={updating}
              className="w-full bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={updating || !currentPassword || newPassword.length < 6 || confirmPassword.length < 6}
              className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-855 text-black disabled:text-neutral-500 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              {updating ? <RefreshCw className="animate-spin" size={13} /> : 'Simpan Password'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsFormOpen(true)}
          className="w-full py-3 bg-neutral-900/60 hover:bg-neutral-800/60 border border-neutral-800 rounded-xl text-[10px] font-black tracking-[0.15em] uppercase text-neutral-400 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
        >
          <Key size={13} /> Ganti Password Akun
        </button>
      )}
    </div>
  )
}
