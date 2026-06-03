'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Unlock, RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface DiscordSettingsFormProps {
  initialApplicationId: string
  initialClientSecret: string
  initialBotToken: string
  initialVipServerId: string
  initialVipRoleId: string
  initialFreeInviteLink: string
  initialRedirectUri: string
}

export default function DiscordSettingsForm({
  initialApplicationId,
  initialClientSecret,
  initialBotToken,
  initialVipServerId,
  initialVipRoleId,
  initialFreeInviteLink,
  initialRedirectUri,
}: DiscordSettingsFormProps) {
  const { showAlert } = useModal()
  const [discordApplicationId, setDiscordApplicationId] = useState(initialApplicationId)
  const [discordClientSecret, setDiscordClientSecret] = useState(initialClientSecret)
  const [discordBotToken, setDiscordBotToken] = useState(initialBotToken)
  const [discordVipServerId, setDiscordVipServerId] = useState(initialVipServerId)
  const [discordVipRoleId, setDiscordVipRoleId] = useState(initialVipRoleId)
  const [discordFreeInviteLink, setDiscordFreeInviteLink] = useState(initialFreeInviteLink)
  const [discordRedirectUri, setDiscordRedirectUri] = useState(initialRedirectUri)
  const [savingDiscord, setSavingDiscord] = useState(false)

  // State untuk visibilitas & penguncian kredensial
  const [showDiscordClientSecret, setShowDiscordClientSecret] = useState(false)
  const [lockDiscordClientSecret, setLockDiscordClientSecret] = useState(true)
  const [showDiscordBotToken, setShowDiscordBotToken] = useState(false)
  const [lockDiscordBotToken, setLockDiscordBotToken] = useState(true)

  const handleSaveDiscordSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingDiscord(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateDiscordSettings',
          applicationId: discordApplicationId,
          clientSecret: discordClientSecret,
          botToken: discordBotToken,
          vipServerId: discordVipServerId,
          vipRoleId: discordVipRoleId,
          freeInviteLink: discordFreeInviteLink,
          redirectUri: discordRedirectUri,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan Discord')
      showAlert({
        title: 'Berhasil',
        message: 'Pengaturan Discord berhasil disimpan!',
        type: 'success',
      })
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Simpan Gagal',
        message: error.message || 'Gagal menyimpan pengaturan Discord!',
        type: 'danger',
      })
    } finally {
      setSavingDiscord(false)
    }
  }

  return (
    <form
      onSubmit={handleSaveDiscordSettings}
      className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg"
    >
      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Discord Application ID</label>
        <input
          type="text"
          placeholder="1511566783566446683"
          value={discordApplicationId}
          onChange={(e) => setDiscordApplicationId(e.target.value)}
          className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
        />
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Discord Client Secret</label>
        <div className="relative">
          <input
            type={showDiscordClientSecret ? 'text' : 'password'}
            placeholder="C2c_..."
            value={discordClientSecret}
            onChange={(e) => setDiscordClientSecret(e.target.value)}
            disabled={lockDiscordClientSecret}
            className={`w-full bg-neutral-900/20 border rounded-xl p-3.5 pr-20 text-xs font-mono outline-none transition-all duration-300 text-white ${
              lockDiscordClientSecret
                ? 'border-neutral-900/50 opacity-50 cursor-not-allowed bg-neutral-950/40'
                : 'border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowDiscordClientSecret(!showDiscordClientSecret)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer"
              title={showDiscordClientSecret ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showDiscordClientSecret ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              type="button"
              onClick={() => setLockDiscordClientSecret(!lockDiscordClientSecret)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                lockDiscordClientSecret
                  ? 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10'
                  : 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
              }`}
              title={lockDiscordClientSecret ? 'Buka Kunci' : 'Kunci'}
            >
              {lockDiscordClientSecret ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Discord Bot Token</label>
        <div className="relative">
          <input
            type={showDiscordBotToken ? 'text' : 'password'}
            placeholder="MTUx..."
            value={discordBotToken}
            onChange={(e) => setDiscordBotToken(e.target.value)}
            disabled={lockDiscordBotToken}
            className={`w-full bg-neutral-900/20 border rounded-xl p-3.5 pr-20 text-xs font-mono outline-none transition-all duration-300 text-white ${
              lockDiscordBotToken
                ? 'border-neutral-900/50 opacity-50 cursor-not-allowed bg-neutral-950/40'
                : 'border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowDiscordBotToken(!showDiscordBotToken)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer"
              title={showDiscordBotToken ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showDiscordBotToken ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              type="button"
              onClick={() => setLockDiscordBotToken(!lockDiscordBotToken)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                lockDiscordBotToken
                  ? 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10'
                  : 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
              }`}
              title={lockDiscordBotToken ? 'Buka Kunci' : 'Kunci'}
            >
              {lockDiscordBotToken ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Discord VIP Server ID (Guild ID)</label>
        <input
          type="text"
          placeholder="1511571839036690482"
          value={discordVipServerId}
          onChange={(e) => setDiscordVipServerId(e.target.value)}
          className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
        />
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Discord VIP Role ID</label>
        <input
          type="text"
          placeholder="1511636275164090449"
          value={discordVipRoleId}
          onChange={(e) => setDiscordVipRoleId(e.target.value)}
          className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
        />
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Discord Free Server Invite Link</label>
        <input
          type="text"
          placeholder="https://discord.gg/xz5XYq3CFt"
          value={discordFreeInviteLink}
          onChange={(e) => setDiscordFreeInviteLink(e.target.value)}
          className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
        />
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Discord Redirect URI (Callback)</label>
        <input
          type="text"
          placeholder="https://.../api/discord/callback"
          value={discordRedirectUri}
          onChange={(e) => setDiscordRedirectUri(e.target.value)}
          className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
        />
        <p className="text-[9px] text-neutral-600 font-bold mt-1">URI callback wajib diakhiri dengan /api/discord/callback</p>
      </div>

      <button
        type="submit"
        disabled={savingDiscord}
        className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98]"
      >
        {savingDiscord ? (
          <>
            <RefreshCw size={12} className="animate-spin" /> Menyimpan...
          </>
        ) : (
          'Simpan Pengaturan Discord'
        )}
      </button>
    </form>
  )
}
