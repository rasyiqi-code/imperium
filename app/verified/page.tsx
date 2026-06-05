'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

/**
 * Halaman konfirmasi sukses verifikasi email.
 * Ditampilkan setelah user berhasil klik link konfirmasi di email.
 * Secara otomatis mengarahkan ke dashboard setelah hitung mundur.
 */
export default function VerifiedPage() {
  const router = useRouter()
  const [countdown, setCountdown] = useState(4)

  useEffect(() => {
    // Hitung mundur, lalu arahkan ke dashboard
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [router])

  return (
    <main className="min-h-screen bg-[#060606] text-white flex items-center justify-center px-4 relative overflow-hidden">
      {/* Efek cahaya latar belakang */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-yellow-500/[0.04] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-green-500/[0.03] rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md w-full space-y-8">
        {/* Logo */}
        <Image
          src="/logo.webp"
          alt="Imperium Crypto Logo"
          width={120}
          height={32}
          className="object-contain opacity-90"
          style={{ height: '2rem', width: 'auto' }}
          priority
        />

        {/* Ikon Centang Animasi */}
        <div className="relative flex items-center justify-center">
          {/* Ring glow berdenyut */}
          <span className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative w-24 h-24 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center shadow-[0_0_40px_rgba(34,197,94,0.15)]">
            <svg
              className="w-12 h-12 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
                className="animate-[dash_0.6s_ease-in-out_forwards]"
              />
            </svg>
          </div>
        </div>

        {/* Teks Utama */}
        <div className="space-y-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
            Email{' '}
            <span className="bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              Terverifikasi!
            </span>
          </h1>
          <p className="text-neutral-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
            Akun Imperium Crypto Anda telah aktif. Kami menyiapkan dashboard eksklusif Anda sekarang.
          </p>
        </div>

        {/* Hitung Mundur */}
        <div className="flex flex-col items-center gap-3">
          <div className="relative w-16 h-16 flex items-center justify-center">
            {/* Progress ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="rgba(212,175,55,0.15)"
                strokeWidth="4"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                fill="none"
                stroke="#d4af37"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (countdown / 4)}`}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <span className="text-xl font-black text-[#d4af37]">{countdown}</span>
          </div>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">
            Mengarahkan ke Dashboard...
          </p>
        </div>

        {/* Tombol Manual jika tidak mau nunggu */}
        <button
          onClick={() => router.push('/dashboard')}
          className="text-xs text-neutral-600 hover:text-neutral-300 transition-colors underline underline-offset-4 font-medium"
        >
          Langsung ke Dashboard
        </button>
      </div>
    </main>
  )
}
