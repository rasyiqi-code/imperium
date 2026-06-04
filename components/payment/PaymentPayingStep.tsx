'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Clock, ExternalLink, Check, Copy, Loader2 } from 'lucide-react'
import PaymentInstructions from './PaymentInstructions'
import { formatRupiah } from '@/lib/payment'

export interface ChargeResult {
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

interface PaymentPayingStepProps {
  chargeData: ChargeResult
  countdown: string
  harga: number
}

export default function PaymentPayingStep({
  chargeData,
  countdown,
  harga,
}: PaymentPayingStepProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
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
            <Image
              src={chargeData.qrUrl}
              alt="QR Code"
              width={208}
              height={208}
              className="object-contain"
              unoptimized // Menghindari kompresi gambar dinamis QR code di sisi server untuk menghemat CPU resource
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
              <div className="flex items-center justify-between gap-2 min-w-0">
                <p className="text-sm sm:text-lg md:text-xl font-black text-white tracking-wider font-mono break-all select-all">{chargeData.billerCode}</p>
                <button 
                  onClick={() => handleCopy(chargeData.billerCode!)} 
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
                >
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
            <div className="flex items-center justify-between gap-2 min-w-0">
              <p className="text-sm sm:text-lg md:text-xl font-black text-yellow-500 tracking-wider font-mono break-all select-all">{chargeData.vaNumber}</p>
              <button 
                onClick={() => handleCopy(chargeData.vaNumber!)} 
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
              >
                {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                {copied ? 'Disalin!' : 'Salin'}
              </button>
            </div>
          </div>

          <PaymentInstructions 
            bank={chargeData.bank} 
            billerCode={chargeData.billerCode} 
            vaNumber={chargeData.vaNumber} 
          />
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
            <div className="flex items-center justify-between gap-2 min-w-0">
              <p className="text-sm sm:text-lg md:text-xl font-black text-yellow-500 tracking-wider font-mono break-all select-all">{chargeData.paymentCode}</p>
              <button 
                onClick={() => handleCopy(chargeData.paymentCode!)} 
                className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-bold text-neutral-400 hover:text-white transition-colors flex items-center gap-1.5 shrink-0"
              >
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
  )
}
