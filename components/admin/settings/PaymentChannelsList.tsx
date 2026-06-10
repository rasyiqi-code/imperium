'use client'

import React, { useState } from 'react'
import { CreditCard, RefreshCw, Zap } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'

interface PaymentChannelsListProps {
  initialEnabledPayments: string[]
}

const PAYMENT_METHODS = [
  { id: 'qris', label: 'QRIS' },
  { id: 'gopay', label: 'GoPay' },
  { id: 'shopeepay', label: 'ShopeePay' },
  { id: 'bca', label: 'BCA VA' },
  { id: 'bni', label: 'BNI VA' },
  { id: 'bri', label: 'BRI VA' },
  { id: 'mandiri', label: 'Mandiri Bill' },
  { id: 'permata', label: 'Permata VA' },
  { id: 'cimb', label: 'CIMB Niaga VA' },
  { id: 'alfamart', label: 'Alfamart' },
  { id: 'indomaret', label: 'Indomaret' },
  { id: 'akulaku', label: 'Akulaku' },
  { id: 'kredivo', label: 'Kredivo' },
]

export default function PaymentChannelsList({ initialEnabledPayments }: PaymentChannelsListProps) {
  const { showAlert } = useModal()
  const [enabledPayments, setEnabledPayments] = useState<string[]>(initialEnabledPayments)
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'syncMidtransPaymentMethods' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal sync')
      setEnabledPayments(data.enabled || [])
      showAlert({
        title: 'Sync Berhasil',
        message: `Berhasil sync! ${data.enabled?.length || 0} metode pembayaran aktif.`,
        type: 'success',
      })
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Sync Gagal',
        message: error.message || 'Gagal sync payment methods',
        type: 'danger',
      })
    } finally {
      setSyncing(false)
    }
  }

  const handleToggle = async (methodId: string, isActive: boolean) => {
    const updated = isActive
      ? enabledPayments.filter((id) => id !== methodId)
      : [...enabledPayments, methodId]
    
    setEnabledPayments(updated) // Optimistic update

    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateEnabledPayments', enabledPayments: updated }),
      })
      if (!res.ok) {
        throw new Error('Gagal mengupdate metode pembayaran')
      }
    } catch {
      setEnabledPayments(enabledPayments) // Rollback jika error
    }
  }

  return (
    <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-left">
          <CreditCard size={14} className="text-yellow-500" />
          <div>
            <p className="text-xs font-black text-white">Payment Channels</p>
            <p className="text-[9px] text-neutral-500 font-bold mt-1">
              {enabledPayments.length} metode aktif
            </p>
          </div>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="flex items-center gap-2 px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 rounded-xl text-[10px] font-black tracking-wider hover:bg-yellow-500/20 disabled:opacity-50 transition-all duration-300 cursor-pointer"
        >
          {syncing ? (
            <>
              <RefreshCw size={12} className="animate-spin" /> Syncing...
            </>
          ) : (
            <>
              <Zap size={12} /> Sync dari Midtrans
            </>
          )}
        </button>
      </div>

      {enabledPayments.length > 0 ? (
        <div className="space-y-2 pt-3 border-t border-neutral-900/60 max-h-[250px] overflow-y-auto scrollbar-thin pr-1">
          {PAYMENT_METHODS.map((method) => {
            const isActive = enabledPayments.includes(method.id)
            return (
              <div key={method.id} className="flex items-center justify-between py-1.5">
                <span className={`text-[11px] font-bold ${isActive ? 'text-white' : 'text-neutral-600'}`}>
                  {method.label}
                </span>
                <button
                  onClick={() => handleToggle(method.id, isActive)}
                  className={`w-10 h-5 rounded-full relative transition-all duration-300 ${
                    isActive ? 'bg-yellow-500' : 'bg-neutral-800 border border-neutral-700'
                  }`}
                >
                  <div
                    className={`absolute top-1 w-3 h-3 rounded-full bg-white shadow-sm transition-all duration-300 ${
                      isActive ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            )
          })}
        </div>
      ) : (
        <p className="text-[10px] text-neutral-600 font-bold text-center py-3">
          Tekan &quot;Sync dari Midtrans&quot; untuk mendeteksi metode pembayaran yang aktif
        </p>
      )}
    </div>
  )
}
