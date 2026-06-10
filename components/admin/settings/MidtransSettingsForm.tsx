'use client'

import React, { useState } from 'react'
import { Eye, EyeOff, Lock, Unlock, RefreshCw } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface MidtransSettingsFormProps {
  initialClientKey: string
  initialServerKey: string
  initialPublicKey: string
  initialIsProduction: boolean
  initialUpgradeMode: string
  initialUseSnap: boolean
}

export default function MidtransSettingsForm({
  initialClientKey,
  initialServerKey,
  initialPublicKey,
  initialIsProduction,
  initialUpgradeMode,
  initialUseSnap,
}: MidtransSettingsFormProps) {
  const { showAlert } = useModal()
  const [midtransClientKey, setMidtransClientKey] = useState(initialClientKey)
  const [midtransServerKey, setMidtransServerKey] = useState(initialServerKey)
  const [midtransPublicKey, setMidtransPublicKey] = useState(initialPublicKey)
  const [midtransIsProduction, setMidtransIsProduction] = useState(initialIsProduction)
  const [midtransUpgradeMode, setMidtransUpgradeMode] = useState(initialUpgradeMode)
  const [midtransUseSnap, setMidtransUseSnap] = useState(initialUseSnap)
  const [savingMidtrans, setSavingMidtrans] = useState(false)

  // State untuk visibilitas & penguncian Server Key
  const [showMidtransServerKey, setShowMidtransServerKey] = useState(false)
  const [lockMidtransServerKey, setLockMidtransServerKey] = useState(true)

  const handleSaveMidtransSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingMidtrans(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateMidtransSettings',
          clientKey: midtransClientKey,
          serverKey: midtransServerKey,
          publicKey: midtransPublicKey,
          isProduction: midtransIsProduction,
          upgradeMode: midtransUpgradeMode,
          useSnap: midtransUseSnap,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal menyimpan pengaturan Midtrans')
      showAlert({
        title: 'Berhasil',
        message: 'Pengaturan Midtrans berhasil disimpan!',
        type: 'success',
      })
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Simpan Gagal',
        message: error.message || 'Gagal menyimpan pengaturan Midtrans!',
        type: 'danger',
      })
    } finally {
      setSavingMidtrans(false)
    }
  }

  return (
    <form
      onSubmit={handleSaveMidtransSettings}
      className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg"
    >
      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Midtrans Client Key</label>
        <input
          type="text"
          placeholder="Mid-client-..."
          value={midtransClientKey}
          onChange={(e) => setMidtransClientKey(e.target.value)}
          className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
        />
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Midtrans Server Key</label>
        <div className="relative">
          <input
            type={showMidtransServerKey ? 'text' : 'password'}
            placeholder="Mid-server-..."
            value={midtransServerKey}
            onChange={(e) => setMidtransServerKey(e.target.value)}
            disabled={lockMidtransServerKey}
            className={`w-full bg-neutral-900/20 border rounded-xl p-3.5 pr-20 text-xs font-mono outline-none transition-all duration-300 text-white ${
              lockMidtransServerKey
                ? 'border-neutral-900/50 opacity-50 cursor-not-allowed bg-neutral-950/40'
                : 'border-neutral-800 focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5'
            }`}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <button
              type="button"
              onClick={() => setShowMidtransServerKey(!showMidtransServerKey)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800/50 transition-colors cursor-pointer"
              title={showMidtransServerKey ? 'Sembunyikan' : 'Tampilkan'}
            >
              {showMidtransServerKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <button
              type="button"
              onClick={() => setLockMidtransServerKey(!lockMidtransServerKey)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                lockMidtransServerKey
                  ? 'text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10'
                  : 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
              }`}
              title={lockMidtransServerKey ? 'Buka Kunci' : 'Kunci'}
            >
              {lockMidtransServerKey ? <Lock size={14} /> : <Unlock size={14} />}
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-left">
        <label className="text-[10px] font-bold text-neutral-400 block">Midtrans Public Key (BI SNAP)</label>
        <textarea
          rows={4}
          placeholder="-----BEGIN PUBLIC KEY-----&#10;...&#10;-----END PUBLIC KEY-----"
          value={midtransPublicKey}
          onChange={(e) => setMidtransPublicKey(e.target.value)}
          className="w-full bg-neutral-900/20 border border-neutral-800 rounded-xl p-3.5 text-xs font-mono outline-none focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/5 text-white transition-all duration-300"
        />
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-900/60">
        <div className="text-left">
          <p className="text-xs font-black text-white">Gunakan Snap API (Redirect)</p>
          <p className="text-[9px] text-neutral-500 font-bold mt-1">Aktifkan untuk menggunakan popup/halaman pembayaran resmi Midtrans (berguna selama pengajuan izin Core API)</p>
        </div>
        <button
          type="button"
          onClick={() => setMidtransUseSnap(!midtransUseSnap)}
          className={`w-10 h-5 rounded-full relative transition-all duration-300 ${
            midtransUseSnap ? 'bg-yellow-500' : 'bg-neutral-800 border border-neutral-700'
          }`}
        >
          <div
            className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${
              midtransUseSnap ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-neutral-900/60">
        <div className="text-left">
          <p className="text-xs font-black text-white">Mode Produksi (Production Mode)</p>
          <p className="text-[9px] text-neutral-500 font-bold mt-1">Aktifkan untuk transaksi real, matikan untuk sandbox</p>
        </div>
        <button
          type="button"
          onClick={() => setMidtransIsProduction(!midtransIsProduction)}
          className={`w-10 h-5 rounded-full relative transition-all duration-300 ${
            midtransIsProduction ? 'bg-yellow-500' : 'bg-neutral-800 border border-neutral-700'
          }`}
        >
          <div
            className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${
              midtransIsProduction ? 'left-6' : 'left-1'
            }`}
          />
        </button>
      </div>

      <div className="space-y-2 text-left pt-3 border-t border-neutral-900/60">
        <label className="text-[10px] font-bold text-neutral-400 block">Sistem Upgrade Member</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
          <button
            type="button"
            onClick={() => setMidtransUpgradeMode('stacking')}
            className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
              midtransUpgradeMode === 'stacking'
                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-lg shadow-yellow-500/5'
                : 'border-neutral-800 bg-neutral-900/20 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <p className="text-[10px] font-black">Akumulasi Durasi (Stacking)</p>
            <p className="text-[9px] text-neutral-500 mt-1.5 leading-relaxed font-medium">Masa aktif paket baru ditambahkan ke akhir masa aktif lama.</p>
          </button>
          <button
            type="button"
            onClick={() => setMidtransUpgradeMode('proration')}
            className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer ${
              midtransUpgradeMode === 'proration'
                ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500 shadow-lg shadow-yellow-500/5'
                : 'border-neutral-800 bg-neutral-900/20 text-neutral-400 hover:border-neutral-700'
            }`}
          >
            <p className="text-[10px] font-black">Potong Harga / Prorasi (Proration)</p>
            <p className="text-[9px] text-neutral-500 mt-1.5 leading-relaxed font-medium">Harga paket baru dikurangi sisa hari aktif lama. Masa aktif baru di-reset mulai hari ini.</p>
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={savingMidtrans}
        className="w-full py-3.5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-black font-black rounded-xl text-[10px] tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/25 active:scale-[0.98]"
      >
        {savingMidtrans ? (
          <>
            <RefreshCw size={12} className="animate-spin" /> Menyimpan...
          </>
        ) : (
          'Simpan Pengaturan Midtrans'
        )}
      </button>
    </form>
  )
}
