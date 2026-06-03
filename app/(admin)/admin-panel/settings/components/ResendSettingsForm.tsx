'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Unlock, RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface ResendSettingsFormProps {
  initialApiKey: string
  initialSenderEmail: string
}

export default function ResendSettingsForm({
  initialApiKey,
  initialSenderEmail,
}: ResendSettingsFormProps) {
  const { showAlert } = useModal()
  const [resendApiKey, setResendApiKey] = useState(initialApiKey)
  const [resendSenderEmail, setResendSenderEmail] = useState(initialSenderEmail)
  const [savingResend, setSavingResend] = useState(false)

  // State untuk visibilitas & penguncian API Key
  const [showResendApiKey, setShowResendApiKey] = useState(false)
  const [lockResendApiKey, setLockResendApiKey] = useState(true)

  const handleSaveResendSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingResend(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateResendSettings',
          apiKey: resendApiKey,
          senderEmail: resendSenderEmail,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan Resend')
      showAlert({
        title: 'Berhasil',
        message: 'Pengaturan Resend berhasil disimpan!',
        type: 'success',
      })
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Simpan Gagal',
        message: error.message || 'Gagal menyimpan pengaturan Resend!',
        type: 'danger',
      })
    } finally {
      setSavingResend(false)
    }
  }

  return (
    <form
      onSubmit={handleSaveResendSettings}
      className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg"
    >
      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Resend API Key</label>
        <div className="relative">
          <input
            type={showResendApiKey ? 'text' : 'password'}
            placeholder="re_..."
            value={resendApiKey}
            onChange={(e) => setResendApiKey(e.target.value)}
            disabled={lockResendApiKey}
            className={`w-full bg-neutral-900/20 border rounded-xl p-3.5 pr-20 text-xs font-mono outline-none transition-all duration-300 text-white ${
              lockResendApiKey
                ? 'border-neutral-900/50 opacity-50 cursor-not-allowed bg-neutral-950/40'
                : 'border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowResendApiKey(!showResendApiKey)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer"
              title={showResendApiKey ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showResendApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              type="button"
              onClick={() => setLockResendApiKey(!lockResendApiKey)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                lockResendApiKey
                  ? 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10'
                  : 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
              }`}
              title={lockResendApiKey ? 'Buka Kunci' : 'Kunci'}
            >
              {lockResendApiKey ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
        </div>
        <p className="text-[9px] text-neutral-600 font-bold mt-1">
          Masukkan API key dari akun Resend Anda
        </p>
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Sender Email</label>
        <input
          type="text"
          placeholder="onboarding@resend.dev"
          value={resendSenderEmail}
          onChange={(e) => setResendSenderEmail(e.target.value)}
          className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
        />
        <p className="text-[9px] text-neutral-600 font-bold mt-1">
          Email pengirim terverifikasi (default: onboarding@resend.dev)
        </p>
      </div>

      <button
        type="submit"
        disabled={savingResend}
        className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98]"
      >
        {savingResend ? (
          <>
            <RefreshCw size={12} className="animate-spin" /> Menyimpan...
          </>
        ) : (
          'Simpan Pengaturan Resend'
        )}
      </button>
    </form>
  )
}
