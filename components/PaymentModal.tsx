'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { X, ArrowLeft, Loader2 } from 'lucide-react'
import PaymentSelectStep, { PaymentMethod } from './payment/PaymentSelectStep'
import PaymentPayingStep, { ChargeResult } from './payment/PaymentPayingStep'
import PaymentSuccessStep from './payment/PaymentSuccessStep'
import PaymentErrorStep from './payment/PaymentErrorStep'
import { formatRupiah, getExpiryCountdown } from '@/lib/payment'

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  paketId: string
  paketNama: string
  harga: number
  originalHarga?: number
  onSuccess: () => void
}

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

  const handleBack = () => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (countdownRef.current) clearInterval(countdownRef.current)
    setStep('select')
    setChargeData(null)
    setSelectedMethod(null)
  }

  if (!isOpen) return null

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
          {/* STEP: LOADING */}
          {step === 'loading' && (
            <div className="py-12 flex flex-col items-center gap-4">
              <Loader2 size={32} className="animate-spin text-yellow-500" />
              <p className="text-[10px] text-neutral-500 font-bold tracking-widest">
                Memuat metode pembayaran...
              </p>
            </div>
          )}

          {/* STEP: SELECT */}
          {step === 'select' && (
            <PaymentSelectStep
              methods={methods}
              loading={loading}
              selectedMethod={selectedMethod}
              onPay={handlePay}
            />
          )}

          {/* STEP: PAYING */}
          {step === 'paying' && chargeData && (
            <PaymentPayingStep
              chargeData={chargeData}
              countdown={countdown}
              harga={harga}
            />
          )}

          {/* STEP: SUCCESS */}
          {step === 'success' && (
            <PaymentSuccessStep onSuccess={onSuccess} />
          )}

          {/* STEP: ERROR */}
          {step === 'error' && (
            <PaymentErrorStep errorMsg={errorMsg} onBack={handleBack} />
          )}
        </div>
      </div>
    </div>
  )
}
