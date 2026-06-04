'use client'

import { useEffect } from 'react'

export default function PWARegister() {
  useEffect(() => {
    // Pastikan berjalan hanya di sisi client (browser) dan browser mendukung Service Worker
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      const registerServiceWorker = async () => {
        try {
          const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
          })
          console.log('PWA Service Worker: Pendaftaran berhasil dengan scope:', registration.scope)
        } catch (error) {
          console.error('PWA Service Worker: Pendaftaran gagal:', error)
        }
      }

      // Tunggu hingga halaman selesai dimuat sepenuhnya
      if (document.readyState === 'complete') {
        registerServiceWorker()
      } else {
        window.addEventListener('load', registerServiceWorker)
        return () => window.removeEventListener('load', registerServiceWorker)
      }
    }
  }, [])

  return null
}
