'use client'

import { useState } from 'react'
import { useModal } from '@/components/ModalProvider'
import { Eye, EyeOff, Save, RefreshCw, ExternalLink } from 'lucide-react'

interface MarketApiSettingsFormProps {
  initialFreecryptoapiKey: string
  initialCoinmarketcapApiKey: string
}

/**
 * Form untuk mengatur API key integrasi data pasar Live Trading Signals.
 * Mendukung FreeCryptoAPI dan CoinMarketCap API key, disimpan ke database admin_settings.
 */
export default function MarketApiSettingsForm({
  initialFreecryptoapiKey,
  initialCoinmarketcapApiKey,
}: MarketApiSettingsFormProps) {
  const { showAlert } = useModal()

  const [freecryptoapiKey, setFreecryptoapiKey] = useState(initialFreecryptoapiKey)
  const [coinmarketcapApiKey, setCoinmarketcapApiKey] = useState(initialCoinmarketcapApiKey)

  // Kontrol visibilitas tiap field secara independen
  const [showFcaKey, setShowFcaKey] = useState(false)
  const [showCmcKey, setShowCmcKey] = useState(false)

  const [saving, setSaving] = useState(false)
  const [testing, setTesting] = useState(false)

  // Simpan API key ke database via admin actions API
  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateMarketApiSettings',
          freecryptoapiKey,
          coinmarketcapApiKey,
        }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        showAlert({
          title: 'API Key Disimpan',
          message: 'API key data pasar berhasil diperbarui dan akan digunakan pada pengambilan data berikutnya.',
          type: 'success',
        })
      } else {
        showAlert({
          title: 'Gagal Menyimpan',
          message: data.error || 'Terjadi kesalahan saat menyimpan API key.',
          type: 'danger',
        })
      }
    } catch {
      showAlert({ title: 'Error', message: 'Gagal terhubung ke server.', type: 'danger' })
    } finally {
      setSaving(false)
    }
  }

  // Uji koneksi FreeCryptoAPI langsung dari panel admin
  const handleTestFca = async () => {
    setTesting(true)
    try {
      const res = await fetch('/api/market?test=1')
      const data = await res.json()

      if (data.success && data.coins?.length > 0) {
        const btc = data.coins.find((c: { symbol: string }) => c.symbol === 'BTC')
        showAlert({
          title: 'Koneksi Berhasil ✓',
          message: `Data berhasil diambil dari FreeCryptoAPI.\nBTC saat ini: ${btc?.price ?? '—'}`,
          type: 'success',
        })
      } else {
        showAlert({
          title: 'Koneksi Gagal',
          message: 'Tidak dapat mengambil data dari FreeCryptoAPI. Pastikan API key valid.',
          type: 'danger',
        })
      }
    } catch {
      showAlert({ title: 'Error', message: 'Gagal terhubung ke API pasar.', type: 'danger' })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 shadow-lg space-y-6">

      {/* Deskripsi */}
      <div className="p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
        <p className="text-[10px] font-bold text-yellow-500/80 leading-relaxed">
          API key di bawah digunakan untuk mengambil data harga pasar real-time pada komponen <strong>Live Trading Signals</strong> di dashboard member.
          Jika tidak diisi, sistem akan menggunakan akses publik FreeCryptoAPI (tanpa key, dengan batasan rate).
        </p>
      </div>

      {/* FreeCryptoAPI */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest block">
              FreeCryptoAPI Key
            </label>
            <p className="text-[9px] text-neutral-600 font-bold mt-0.5">
              Sumber data utama harga, volume & perubahan 24h
            </p>
          </div>
          <a
            href="https://freecryptoapi.com/panel"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
          >
            Dapatkan Key <ExternalLink size={9} />
          </a>
        </div>
        <div className="relative">
          <input
            type={showFcaKey ? 'text' : 'password'}
            value={freecryptoapiKey}
            onChange={(e) => setFreecryptoapiKey(e.target.value)}
            placeholder="fca_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 pr-10 text-xs font-mono text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
          <button
            onClick={() => setShowFcaKey(!showFcaKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
          >
            {showFcaKey ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </div>

      {/* CoinMarketCap API */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-[10px] font-black text-neutral-300 uppercase tracking-widest block">
              CoinMarketCap API Key
            </label>
            <p className="text-[9px] text-neutral-600 font-bold mt-0.5">
              Cadangan data & logo coin (opsional)
            </p>
          </div>
          <a
            href="https://pro.coinmarketcap.com/account"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[9px] text-yellow-500 hover:text-yellow-400 font-bold transition-colors"
          >
            Dapatkan Key <ExternalLink size={9} />
          </a>
        </div>
        <div className="relative">
          <input
            type={showCmcKey ? 'text' : 'password'}
            value={coinmarketcapApiKey}
            onChange={(e) => setCoinmarketcapApiKey(e.target.value)}
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 pr-10 text-xs font-mono text-neutral-200 placeholder-neutral-700 focus:outline-none focus:border-yellow-500/50 transition-colors"
          />
          <button
            onClick={() => setShowCmcKey(!showCmcKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-neutral-300 transition-colors"
          >
            {showCmcKey ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>
        </div>
      </div>

      {/* Tombol aksi */}
      <div className="flex gap-3 pt-1">
        <button
          onClick={handleTestFca}
          disabled={testing}
          className="flex items-center gap-2 px-4 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={11} className={testing ? 'animate-spin' : ''} />
          Uji Koneksi
        </button>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all active:scale-95 disabled:opacity-50 cursor-pointer shadow-lg shadow-yellow-500/10"
        >
          <Save size={11} className={saving ? 'animate-pulse' : ''} />
          {saving ? 'Menyimpan...' : 'Simpan API Key'}
        </button>
      </div>
    </div>
  )
}
