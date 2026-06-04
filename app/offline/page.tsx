'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

export default function OfflinePage() {
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      window.location.reload()
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#020202] text-white p-6 relative overflow-hidden font-sans select-none">
      {/* Glow background effects */}
      <div className="absolute top-[20%] left-[20%] w-[300px] h-[300px] bg-yellow-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />

      <div className="w-full max-w-md text-center space-y-8 relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-2">
          <Image 
            src="/logo.webp" 
            alt="Imperium Crypto Logo" 
            width={180}
            height={48}
            className="object-contain"
            style={{ height: '2.5rem', width: 'auto' }}
            priority
          />
        </div>

        {/* WifiOff Icon with animated pulse */}
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-red-500/10 blur-xl animate-pulse scale-125" />
            <div className="h-20 w-20 rounded-3xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-red-500 shadow-2xl relative">
              <WifiOff size={36} className="animate-bounce-slow" />
            </div>
          </div>
        </div>

        {/* Text Details */}
        <div className="space-y-3">
          <h1 className="text-2xl font-black uppercase tracking-tight text-white">
            Koneksi Terputus
          </h1>
          <p className="text-neutral-400 text-xs leading-relaxed max-w-xs mx-auto">
            Sepertinya perangkat Anda tidak terhubung ke internet. Beberapa fitur atau data mungkin tidak dapat diakses saat ini.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="w-full sm:w-auto min-w-[150px] group relative flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-3 text-xs font-bold text-black transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Coba Lagi</span>
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full sm:w-auto min-w-[150px] flex items-center justify-center gap-2 rounded-xl bg-neutral-900 border border-neutral-800 px-5 py-3 text-xs font-bold text-neutral-300 hover:text-white hover:bg-neutral-800 hover:border-neutral-700 transition-all active:scale-95"
          >
            <Home className="h-4 w-4" />
            <span>Halaman Utama</span>
          </button>
        </div>

        {/* Small Notice */}
        <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest pt-6">
          Imperium Crypto PWA · Offline Mode
        </p>
      </div>
    </div>
  )
}
