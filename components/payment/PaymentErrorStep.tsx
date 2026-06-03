'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface PaymentErrorStepProps {
  errorMsg: string
  onBack: () => void
}

export default function PaymentErrorStep({
  errorMsg,
  onBack,
}: PaymentErrorStepProps) {
  return (
    <div className="py-8 flex flex-col items-center gap-5 animate-in fade-in zoom-in-95 duration-500">
      <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center">
        <AlertCircle size={40} className="text-red-500" />
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-xl font-black text-white">Terjadi Kesalahan</h3>
        <p className="text-sm text-neutral-500 font-medium max-w-xs">{errorMsg}</p>
      </div>
      <button
        onClick={onBack}
        className="w-full bg-neutral-800 hover:bg-neutral-700 text-white py-4 rounded-2xl font-black tracking-tight text-sm transition-all active:scale-[0.98]"
      >
        Coba Lagi
      </button>
    </div>
  )
}
