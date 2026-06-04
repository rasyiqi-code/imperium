'use client'

import Image from 'next/image'

interface LoaderProps {
  fullScreen?: boolean
  label?: string
}

export default function Loader({ fullScreen = false, label = 'Memuat...' }: LoaderProps) {
  return (
    <div 
      className={`flex flex-col items-center justify-center transition-all duration-300 ${
        fullScreen 
          ? 'fixed inset-0 z-50 bg-black/95 backdrop-blur-md' 
          : 'min-h-[75vh] w-full flex-1'
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Ring luar emas berputar yang halus */}
        <div className="w-16 h-16 rounded-full border border-yellow-500/20 border-t-yellow-500 border-r-yellow-500 animate-spin" />
        
        {/* Logo Imperium di tengah yang berdenyut */}
        <div className="absolute w-10 h-10 rounded-xl overflow-hidden bg-black/80 p-1 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.35)] animate-pulse">
          <Image 
            src="/logo.webp" 
            alt="Imperium Logo" 
            width={32} 
            height={32} 
            className="object-contain rounded-lg"
            style={{ height: 'auto' }}
          />
        </div>
      </div>
      
      {/* Teks label loading yang berdenyut lembut */}
      {label && (
        <span className="mt-4 text-[9px] font-black uppercase tracking-[0.25em] text-yellow-500/80 animate-pulse">
          {label}
        </span>
      )}
    </div>
  )
}
