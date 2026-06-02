'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  X,
  QrCode,
  Landmark,
  Copy,
  Check,
  ArrowLeft,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Store,
  Wallet,
  ExternalLink,
} from 'lucide-react'

/* ─── types ────────────────────────────────────────────────────── */

interface PaymentMethod {
  id: string
  label: string
  sublabel: string
  category: string
}

interface ChargeResult {
  orderId: string
  transactionStatus: string
  expiryTime: string
  grossAmount: string
  type: 'qris' | 'va' | 'cstore' | 'redirect' | 'unknown'
  qrUrl?: string
  deeplinkUrl?: string
  bank?: string
  vaNumber?: string
  billerCode?: string
  store?: string
  paymentCode?: string
  redirectUrl?: string
  redirectLabel?: string
}

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paketId: string
  paketNama: string
  harga: number
  originalHarga?: number
  onSuccess: () => void
}

/* ─── icon mapping ─────────────────────────────────────────────── */

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ewallet: <QrCode size={20} />,
  va: <Landmark size={20} />,
  cstore: <Store size={20} />,
  paylater: <Wallet size={20} />,
}

/* ─── helpers ──────────────────────────────────────────────────── */

function formatRupiah(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function getExpiryCountdown(expiryTime: string): string {
  const diff = new Date(expiryTime).getTime() - Date.now()
  if (diff <= 0) return '00:00:00'
  const h = Math.floor(diff / 3600000)
  const m = Math.floor((diff % 3600000) / 60000)
  const s = Math.floor((diff % 60000) / 1000)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const CATEGORY_LABELS: Record<string, string> = {
  ewallet: 'E-Wallet & QRIS',
  va: 'Virtual Account',
  cstore: 'Gerai & Minimarket',
  paylater: 'PayLater',
}

/* ─── component ────────────────────────────────────────────────── */

export default function PaymentModal({
  isOpen,
  onClose,
  paketId,
  paketNama,
  harga,
  originalHarga,
  onSuccess,
}: PaymentModalProps) {
  const [step, setStep] = useState<'loading' | 'select' | 'paying' | 'success' | 'error'>('loading')
  const [methods, setMethods] = useState<PaymentMethod[]>([])
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [chargeData, setChargeData] = useState<ChargeResult | null>(null)
  const [copied, setCopied] = useState(false)
  const [countdown, setCountdown] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch available payment methods on modal open
  useEffect(() => {
    if (!isOpen) return

    const timer = setTimeout(() => {
      setStep('loading')
      setSelectedMethod(null)
      setChargeData(null)
      setErrorMsg('')

      const fetchMethods = async () => {
        try {
          const res = await fetch('/api/config/payment-methods')
          if (!res.ok) throw new Error('Gagal memuat metode pembayaran')
          const data = await res.json()

          if (data.needsSync || !data.methods?.length) {
            setMethods([])
            setErrorMsg('Metode pembayaran belum dikonfigurasi. Admin perlu sync dari Dashboard Midtrans.')
            setStep('error')
            return
          }

          setMethods(data.methods)
          setStep('select')
        } catch (err: unknown) {
          const error = err as Error
          setErrorMsg(error.message || 'Gagal memuat metode pembayaran')
          setStep('error')
        }
      }

      fetchMethods()
    }, 0)

    return () => {
      clearTimeout(timer)
      if (pollRef.current) clearInterval(pollRef.current)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [isOpen])

  // Countdown timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    if (step === 'paying' && chargeData?.expiryTime) {
      timer = setTimeout(() => {
        setCountdown(getExpiryCountdown(chargeData.expiryTime))
        countdownRef.current = setInterval(() => {
          const val = getExpiryCountdown(chargeData.expiryTime)
          setCountdown(val)
          if (val === '00:00:00' && countdownRef.current) {
            clearInterval(countdownRef.current)
          }
        }, 1000)
      }, 0)
    }
    return () => {
      if (timer) clearTimeout(timer)
      if (countdownRef.current) clearInterval(countdownRef.current)
    }
  }, [step, chargeData])

  // Status polling
  const startPolling = useCallback((orderId: string) => {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?orderId=${orderId}`)
        if (!res.ok) return
        const data = await res.json()

        if (data.transactionStatus === 'settlement' || data.transactionStatus === 'capture') {
          if (pollRef.current) clearInterval(pollRef.current)
          await fetch('/api/checkout/check', { method: 'POST' })
          setStep('success')
        } else if (['expire', 'deny', 'cancel'].includes(data.transactionStatus)) {
          if (pollRef.current) clearInterval(pollRef.current)
          setErrorMsg('Pembayaran gagal atau kedaluwarsa')
          setStep('error')
        }
      } catch {
        // silently continue polling
      }
    }, 5000)
  }, [])

  // Handle method selection & charge
  const handlePay = async (methodId: string) => {
    setSelectedMethod(methodId)
    setLoading(true)
    setErrorMsg('')

    try {
      const res = await fetch('/api/checkout/charge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paketId, paymentType: methodId }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Gagal membuat transaksi')
      }

      setChargeData(data)

      // For redirect-type payments, open in new tab
      if (data.type === 'redirect' && data.redirectUrl) {
        window.open(data.redirectUrl, '_blank')
      }

      setStep('paying')
      startPolling(data.orderId)
    } catch (err: unknown) {
      const error = err as Error
      setErrorMsg(error.message || 'Terjadi kesalahan')
      setStep('error')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleBack = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    setStep('select')
    setChargeData(null)
    setSelectedMethod(null)
  }

  if (!isOpen) return null

  // Group methods by category
  const grouped = methods.reduce<Record<string, PaymentMethod[]>>((acc, m) => {
    ;(acc[m.category] ??= []).push(m)
    return acc
  }, {})

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={step === 'paying' ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-md max-h-[92vh] overflow-y-auto bg-neutral-950 border border-neutral-800 sm:rounded-3xl rounded-t-3xl shadow-2xl shadow-yellow-500/5 animate-in slide-in-from-bottom-4 duration-500 ease-out">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-neutral-950/95 backdrop-blur-lg border-b border-neutral-800/50 px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(step === 'paying' || step === 'error') && (
              <button
                onClick={handleBack}
                className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
            )}
            <div>
              <h2 className="text-sm font-black text-white tracking-tight">
                {step === 'loading' && 'Memuat...'}
                {step === 'select' && 'Pilih Pembayaran'}
                {step === 'paying' && 'Selesaikan Pembayaran'}
                {step === 'success' && 'Pembayaran Berhasil'}
                {step === 'error' && 'Pembayaran Gagal'}
              </h2>
              <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest mt-0.5">
                Imperium Crypto
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (step === 'success') onSuccess()
              else onClose()
            }}
            className="w-8 h-8 rounded-full bg-neutral-800 hover:bg-neutral-700 flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Amount bar */}
        {(step === 'select' || step === 'paying') && (
          <div className="px-5 py-3 bg-neutral-900/50 border-b border-neutral-800/30 flex items-center justify-between">
            <div>
              <p className="text-[9px] font-bold text-neutral-600 tracking-widest">Total Bayar</p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-black text-yellow-500">{formatRupiah(harga)}</span>
                {originalHarga && originalHarga > harga && (
                  <span className="text-xs font-bold text-neutral-500 line-through">{formatRupiah(originalHarga)}</span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-bold text-neutral-600 tracking-widest">Paket</p>
              <p className="text-xs font-bold text-white">{paketNama}</p>
            </div>
          </div>
        )}

        <div className="p-5">
          {/* ─── STEP: LOADING ───────────────────────── */}
          {step === 'loading' && (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 size={32} className="animate-spin text-yellow-500" />
              <p className="text-[10px] text-neutral-500 font-bold tracking-widest">
                Memuat metode pembayaran...
              </p>
            </div>
          )}

          {/* ─── STEP: SELECT ────────────────────────── */}
          {step === 'select' && (
            <div className="space-y-4">
              {Object.entries(grouped).map(([category, items]) => (
                <div key={category}>
                  <p className="text-[9px] font-black text-neutral-600 tracking-[0.2em] mb-2">
                    {CATEGORY_LABELS[category] || category}
                  </p>
                  <div className="space-y-2">
                    {items.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handlePay(method.id)}
                        disabled={loading}
                        className="w-full flex items-center gap-4 p-4 rounded-2xl border border-neutral-800 bg-neutral-900/50 hover:bg-neutral-800/60 hover:border-yellow-500/30 transition-all active:scale-[0.98] disabled:opacity-50 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 text-neutral-400 flex items-center justify-center shrink-0 group-hover:bg-yellow-500/10 group-hover:text-yellow-500 transition-colors">
                          {CATEGORY_ICONS[category] || <Wallet size={20} />}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="text-sm font-bold text-white">{method.label}</p>
                          <p className="text-[10px] text-neutral-500 font-medium truncate">{method.sublabel}</p>
                        </div>
                        {loading && selectedMethod === method.id ? (
                          <Loader2 size={18} className="animate-spin text-yellow-500 shrink-0" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border border-neutral-700 group-hover:border-yellow-500/50 transition-colors shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              {/* Secure badge */}
              <div className="flex items-center justify-center gap-2 pt-3 text-neutral-600">
                <ShieldCheck size={12} />
                <span className="text-[9px] font-black tracking-widest">
                  Pembayaran Aman & Terenkripsi
                </span>
              </div>
            </div>
          )}

          {/* ─── STEP: PAYING ────────────────────────── */}
          {step === 'paying' && chargeData && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-400">
              {/* Timer */}
              {chargeData.expiryTime && (
                <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                  <Clock size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-amber-500">
                    Selesaikan dalam {countdown}
                  </span>
                </div>
              )}

              {/* QRIS Display */}
              {chargeData.type === 'qris' && chargeData.qrUrl && (
                <div className="flex flex-col items-center gap-4">
                  <div className="bg-white p-4 rounded-2xl shadow-lg shadow-white/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={chargeData.qrUrl}
                      alt="QR Code"
                      className="w-52 h-52 object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-neutral-500 font-medium text-center">
                    Scan QR code di atas menggunakan aplikasi e-wallet Anda
                  </p>
                  {chargeData.deeplinkUrl && (
                    <a
                      href={chargeData.deeplinkUrl}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-bold hover:bg-green-500/20 transition-colors"
                    >
                      <ExternalLink size={14} />
                      Buka di Aplikasi
                    </a>
                  )}
                </div>
              )}

              {/* VA Display */}
              {chargeData.type === 'va' && (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-neutral-600 tracking-[0.2em] mb-1">
                      {chargeData.bank?.toUpperCase()} {chargeData.billerCode ? 'Bill Payment' : 'Virtual Account'}
                    </p>
                  </div>

                  {chargeData.billerCode && (
                    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                      <p className="text-[9px] font-bold text-neutral-600 tracking-widest mb-1">Biller Code</p>
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-black text-white tracking-wider font-mono">{chargeData.billerCode}</p>
                        <button onClick={() => handleCopy(chargeData.billerCode!)} className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
                          {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                          {copied ? 'Disalin!' : 'Salin'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                    <p className="text-[9px] font-bold text-neutral-600 tracking-widest mb-1">
                      {chargeData.billerCode ? 'Bill Key' : 'Nomor Virtual Account'}
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-black text-yellow-500 tracking-wider font-mono">{chargeData.vaNumber}</p>
                      <button onClick={() => handleCopy(chargeData.vaNumber!)} className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copied ? 'Disalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>

                  <PaymentInstructions bank={chargeData.bank} billerCode={chargeData.billerCode} vaNumber={chargeData.vaNumber} />
                </div>
              )}

              {/* CStore Display */}
              {chargeData.type === 'cstore' && (
                <div className="space-y-3">
                  <div className="text-center">
                    <p className="text-[9px] font-black text-neutral-600 tracking-[0.2em] mb-1">
                      {chargeData.store?.toUpperCase()} — Kode Pembayaran
                    </p>
                  </div>
                  <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                    <p className="text-[9px] font-bold text-neutral-600 tracking-widest mb-1">Kode Pembayaran</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-black text-yellow-500 tracking-wider font-mono">{chargeData.paymentCode}</p>
                      <button onClick={() => handleCopy(chargeData.paymentCode!)} className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5">
                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        {copied ? 'Disalin!' : 'Salin'}
                      </button>
                    </div>
                  </div>
                  <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-4 space-y-2">
                    <p className="text-[9px] font-black text-neutral-600 tracking-[0.2em]">Cara Bayar</p>
                    <ol className="space-y-1.5 text-[11px] text-neutral-500 font-medium list-decimal list-inside">
                      <li>Kunjungi gerai <span className="text-white font-bold">{chargeData.store?.charAt(0).toUpperCase()}{chargeData.store?.slice(1)}</span> terdekat</li>
                      <li>Sebutkan pembayaran melalui <span className="text-white font-bold">Midtrans</span></li>
                      <li>Berikan kode pembayaran: <span className="text-yellow-500 font-bold">{chargeData.paymentCode}</span></li>
                      <li>Bayar sebesar <span className="text-white font-bold">{formatRupiah(harga)}</span></li>
                      <li>Simpan struk pembayaran Anda</li>
                    </ol>
                  </div>
                </div>
              )}

              {/* Redirect Display (ShopeePay, Akulaku, Kredivo) */}
              {chargeData.type === 'redirect' && (
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-yellow-500/10 border-2 border-yellow-500/20 flex items-center justify-center">
                    <ExternalLink size={28} className="text-yellow-500" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-sm font-bold text-white">
                      Selesaikan pembayaran di aplikasi {chargeData.redirectLabel?.replace('Buka ', '')}
                    </p>
                    <p className="text-[10px] text-neutral-500 font-medium">
                      Halaman pembayaran sudah dibuka di tab baru. Setelah selesai, pembayaran akan otomatis terkonfirmasi.
                    </p>
                  </div>
                  {chargeData.redirectUrl && (
                    <a
                      href={chargeData.redirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-yellow-500 text-black text-sm font-black tracking-tight hover:bg-yellow-400 transition-all active:scale-[0.98]"
                    >
                      <ExternalLink size={16} />
                      {chargeData.redirectLabel || 'Buka Halaman Pembayaran'}
                    </a>
                  )}
                </div>
              )}

              {/* Polling indicator */}
              <div className="flex items-center justify-center gap-2 text-neutral-600">
                <Loader2 size={12} className="animate-spin" />
                <span className="text-[9px] font-bold tracking-widest">
                  Menunggu pembayaran...
                </span>
              </div>
            </div>
          )}

          {/* ─── STEP: SUCCESS ───────────────────────── */}
          {step === 'success' && (
            <div className="py-8 flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center">
                <CheckCircle2 size={40} className="text-green-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-white">Pembayaran Berhasil!</h3>
                <p className="text-sm text-neutral-500 font-medium max-w-xs">
                  Selamat! Akun VIP Imperium kamu sudah aktif. Nikmati semua fitur premium.
                </p>
              </div>
              <button
                onClick={onSuccess}
                className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-4 rounded-2xl font-black tracking-tight text-sm transition-all active:scale-[0.98] shadow-lg shadow-yellow-500/20"
              >
                Masuk ke Dashboard
              </button>
            </div>
          )}

          {/* ─── STEP: ERROR ─────────────────────────── */}
          {step === 'error' && (
            <div className="py-8 flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-500">
              <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
                <AlertCircle size={40} className="text-red-500" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-xl font-black text-white">Terjadi Kesalahan</h3>
                <p className="text-sm text-neutral-500 font-medium max-w-xs">{errorMsg}</p>
              </div>
              <button
                onClick={handleBack}
                className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-4 rounded-2xl font-black tracking-tight text-sm transition-all active:scale-[0.98]"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── sub-component: VA payment instructions ──────────────────── */

function PaymentInstructions({
  bank,
  billerCode,
  vaNumber,
}: {
  bank?: string
  billerCode?: string
  vaNumber?: string
}) {
  return (
    <div className="bg-neutral-900/50 border border-neutral-800/50 rounded-2xl p-4 space-y-2">
      <p className="text-[9px] font-black text-neutral-600 tracking-[0.2em]">Cara Bayar</p>
      <ol className="space-y-1.5 text-[11px] text-neutral-500 font-medium list-decimal list-inside">
        <li>Buka aplikasi m-banking atau ATM <span className="text-white font-bold">{bank?.toUpperCase()}</span></li>
        <li>Pilih menu Transfer atau Bayar</li>
        {billerCode ? (
          <>
            <li>Masukkan Biller Code: <span className="text-white font-bold">{billerCode}</span></li>
            <li>Masukkan Bill Key: <span className="text-white font-bold">{vaNumber}</span></li>
          </>
        ) : (
          <li>Masukkan nomor VA: <span className="text-white font-bold">{vaNumber}</span></li>
        )}
        <li>Konfirmasi dan selesaikan pembayaran</li>
      </ol>
    </div>
  )
}
