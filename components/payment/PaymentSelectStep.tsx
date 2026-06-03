'use client'

import React from 'react'
import { QrCode, Landmark, Store, Wallet, ShieldCheck, Loader2 } from 'lucide-react'

export interface PaymentMethod {
  id: string
  label: string
  sublabel: string
  category: string
}

interface PaymentSelectStepProps {
  methods: PaymentMethod[]
  loading: boolean
  selectedMethod: string | null
  onPay: (methodId: string) => void
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ewallet: <QrCode size={20} />,
  va: <Landmark size={20} />,
  cstore: <Store size={20} />,
  paylater: <Wallet size={20} />,
}

const CATEGORY_LABELS: Record<string, string> = {
  ewallet: 'E-Wallet & QRIS',
  va: 'Virtual Account',
  cstore: 'Gerai & Minimarket',
  paylater: 'PayLater',
}

export default function PaymentSelectStep({
  methods,
  loading,
  selectedMethod,
  onPay,
}: PaymentSelectStepProps) {
  // Group methods by category
  const grouped = methods.reduce<Record<string, PaymentMethod[]>>((acc, m) => {
    ;(acc[m.category] ??= []).push(m)
    return acc
  }, {})

  return (
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
                onClick={() => onPay(method.id)}
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
  )
}
