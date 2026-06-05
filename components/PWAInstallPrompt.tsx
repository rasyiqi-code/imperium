'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstallPrompt() {
  const pathname = usePathname()
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Periksa apakah user pernah menolak prompt ini di sesi sekarang
    const isDismissed = sessionStorage.getItem('pwa-install-dismissed') === 'true'
    if (isDismissed) return

    // Coba deteksi jika aplikasi dijalankan dalam mode standalone (sudah terinstal)
    if (typeof window !== 'undefined') {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      if (isStandalone) return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Cegah prompt bawaan browser muncul secara otomatis
      e.preventDefault()
      // Simpan event untuk dipicu nanti
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Tampilkan UI kustom kita
      setShowPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Tampilkan prompt instalasi browser asli
    await deferredPrompt.prompt()

    // Tunggu respon pengguna
    const { outcome } = await deferredPrompt.userChoice
    console.log(`PWA: User choice outcome is ${outcome}`)

    // Bersihkan state prompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Simpan status ditolak ke sessionStorage agar tidak mengganggu navigasi halaman berikutnya di sesi yang sama
    sessionStorage.setItem('pwa-install-dismissed', 'true')
  }

  if (!showPrompt) return null

  // Deteksi rute dashboard untuk menyesuaikan posisi di mobile agar tidak bertumpuk dengan MobileNav
  const isDashboard = pathname?.startsWith('/dashboard')

  return (
    <div
      className={`fixed z-[9999] left-4 right-4 md:right-auto md:left-6 max-w-sm p-4 rounded-2xl bg-neutral-950/95 backdrop-blur-md border border-yellow-500/20 shadow-2xl shadow-yellow-500/5 transition-all duration-500 transform translate-y-0 animate-fade-in-up ${
        isDashboard 
          ? 'bottom-[76px] md:bottom-6' 
          : 'bottom-4 md:bottom-6'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Ikon Unduh dengan Efek Glow */}
        <div className="h-10 w-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500 shrink-0">
          <Download size={20} className="animate-bounce" style={{ animationDuration: '3s' }} />
        </div>

        {/* Konten Teks */}
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider leading-none">
              Aplikasi Imperium Crypto
            </h4>
            <button 
              onClick={handleDismiss}
              className="text-neutral-500 hover:text-white transition-colors duration-200"
              aria-label="Tutup"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1.5 leading-relaxed">
            Pasang aplikasi di layar utama Anda untuk akses instan, loading lebih cepat, dan dukungan mode offline.
          </p>
          
          {/* Tombol Aksi */}
          <div className="flex items-center gap-3 mt-3.5">
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2 px-3 rounded-lg bg-yellow-500 text-black text-[10px] font-bold uppercase tracking-wider text-center hover:bg-yellow-400 active:scale-95 transition-all duration-300 shadow-md shadow-yellow-500/15"
            >
              Instal Aplikasi
            </button>
            <button
              onClick={handleDismiss}
              className="py-2 px-3 rounded-lg border border-neutral-800 text-neutral-400 text-[10px] font-bold uppercase tracking-wider text-center hover:bg-neutral-900 hover:text-white transition-all duration-300"
            >
              Nanti saja
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
