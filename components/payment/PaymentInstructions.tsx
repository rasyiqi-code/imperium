'use client'

import React from 'react'

interface PaymentInstructionsProps {
  bank?: string
  billerCode?: string
  vaNumber?: string
}

export default function PaymentInstructions({
  bank,
  billerCode,
  vaNumber,
}: PaymentInstructionsProps) {
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
