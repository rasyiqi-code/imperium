'use client'

import React, { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function FloatingWhatsApp() {
  const pathname = usePathname()
  const [showTooltip, setShowTooltip] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('62812345678')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true)
    }, 0)

    async function fetchSupportConfig() {
      try {
        const res = await fetch('/api/support')
        if (res.ok) {
          const data = await res.json()
          if (data.whatsappNumber) {
            setWhatsappNumber(data.whatsappNumber)
          }
        }
      } catch (err) {
        console.error('Gagal mengambil nomor WhatsApp admin dari API:', err)
      }
    }

    fetchSupportConfig()

    return () => clearTimeout(timer)
  }, [])

  // Cegah rendering di sisi server (SSR) untuk menghindari Hydration Mismatch
  if (!mounted || !whatsappNumber) return null

  // Deteksi rute dashboard untuk menyesuaikan posisi di mobile agar tidak bertumpuk dengan MobileNav
  const isDashboard = pathname?.startsWith('/dashboard')

  // Bersihkan karakter non-numerik dari nomor WhatsApp (misal tanda '+', spasi, atau strip)
  const cleanedPhone = whatsappNumber.replace(/\D/g, '')

  return (
    <div
      className={`fixed z-[9999] right-6 transition-all duration-500 flex items-center gap-3 ${
        isDashboard 
          ? 'bottom-[76px] md:bottom-6' 
          : 'bottom-6 md:bottom-6'
      }`}
    >
      {/* Tooltip Kustom Premium */}
      <div
        className={`bg-neutral-950/95 text-white border border-green-500/20 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider shadow-2xl transition-all duration-300 pointer-events-none whitespace-nowrap ${
          showTooltip 
            ? 'opacity-100 translate-x-0' 
            : 'opacity-0 translate-x-2'
        }`}
      >
        Ada Pertanyaan? Chat Admin
      </div>

      {/* Tombol Floating WhatsApp */}
      <a
        href={`https://wa.me/${cleanedPhone}`}
        target="_blank"
        rel="noopener noreferrer"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="relative flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_8px_30px_rgba(37,211,102,0.4)] hover:shadow-[0_8px_40px_rgba(37,211,102,0.6)] transition-all duration-500 hover:scale-115 active:scale-95 group"
        aria-label="Hubungi Admin via WhatsApp"
      >
        {/* Ring Efek Glow Berdenyut di Latar Belakang */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping group-hover:bg-[#25D366]/60" style={{ animationDuration: '2.5s' }} />

        {/* Ikon WhatsApp SVG Asli */}
        <svg className="w-7 h-7 fill-current relative z-10" viewBox="0 0 24 24">
          <path d="M12.012 2c-5.506 0-9.988 4.482-9.988 9.988 0 1.76.457 3.473 1.328 4.985l-1.411 5.158 5.278-1.385c1.45.79 3.08 1.21 4.78 1.21 5.507 0 9.99-4.482 9.99-9.988 0-5.506-4.483-9.988-9.99-9.988zm6.57 13.917c-.27.76-1.34 1.39-2.09 1.48-.52.06-1.19.1-3.48-.85-2.93-1.22-4.81-4.21-4.96-4.41-.15-.2-1.22-1.62-1.22-3.1 0-1.47.77-2.19 1.04-2.48.27-.29.59-.36.79-.36.2 0 .4 0 .58.01.19.01.44-.07.69.53.25.61.87 2.13.95 2.29.08.16.13.35.02.56-.11.22-.24.35-.38.52-.14.17-.3.38-.13.68.17.3.77 1.27 1.65 2.05.76.68 1.4 1.12 1.99 1.41.36.18.63.15.86-.12.23-.27.99-1.15 1.25-1.55.26-.4.53-.33.89-.2.36.13 2.29 1.08 2.39 1.13.1.05.17.08.2.14.04.06.04.35-.23 1.12z" />
        </svg>
      </a>
    </div>
  )
}
