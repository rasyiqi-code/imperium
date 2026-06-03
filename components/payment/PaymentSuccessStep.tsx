'use client'

import React from 'react'
import { CheckCircle2 } from 'lucide-react'

interface PaymentSuccessStepProps {
  onSuccess: () => void
}

export default function PaymentSuccessStep({
  onSuccess,
}: PaymentSuccessStepProps) {
  return (
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
  )
}
