'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, LogIn, RefreshCw } from 'lucide-react'

// Definisikan tipe data biar gak pake ANY
interface UserProfile {
  plan: string | null
}

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data?.user) {
        // Ambil data plan secara aman dari server-side API Actions
        const res = await fetch('/api/user/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getUserPlan' })
        })
        
        const resData = await res.json()
        if (!res.ok) throw new Error(resData.error || 'Gagal mengambil informasi plan pengguna.')

        const userPlan = resData.plan

        // Sinkronkan session ke server
        router.refresh()
        
        // Jeda sebentar biar cookie nempel sempurna sebelum redirect
        setTimeout(() => {
          setLoading(false)
          if (userPlan === 'admin') {
            window.location.href = '/admin-panel'
          } else {
            window.location.href = '/dashboard'
          }
        }, 800)
      }
    } catch (err: unknown) {
      // Menangani error tanpa menggunakan 'any'
      const errorResponse = err as { message?: string }
      console.error('FULL ERROR DEBUG:', errorResponse)
      
      setErrorMsg(errorResponse.message || 'Akses Ditolak: Periksa koneksi atau kredensial.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-neutral-950 text-white font-sans">
      {/* Kolom Kiri: Formulir Login */}
      <div className="flex flex-col justify-center items-center px-6 md:px-12 py-12 relative overflow-hidden">
        {/* Dekorasi latar belakang bercahaya */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="Imperium Crypto Logo" 
                className="h-12 w-auto object-contain" 
              />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase">
              WELCOME <span className="bg-linear-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">BACK</span>
            </h1>
            <p className="text-neutral-500 text-xs mt-2">Masuk ke portal eksklusif Imperium Crypto.</p>
          </div>

          <div className="rounded-3xl bg-neutral-900/50 p-6 md:p-7 shadow-2xl border border-neutral-800 backdrop-blur-xl">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest ml-1 uppercase">
                  Email Anda
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    type="email"
                    className="w-full rounded-2xl bg-neutral-950 p-3 pl-11 text-sm text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase">
                    Password
                  </label>
                  <a href="https://wa.me/6281995100401?text=Halo%20Admin,%20saya%20lupa%20password%20akun%20Imperium%20Crypto%20saya" target="_blank" className="text-[10px] text-yellow-500/70 hover:text-yellow-500 font-bold tracking-widest transition uppercase">
                    Lupa?
                  </a>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-2xl bg-neutral-950 p-3 pl-11 pr-11 text-sm text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-950/20 border border-red-900/50 p-2.5 text-center text-[11px] text-red-400 animate-pulse">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-yellow-400 to-amber-500 p-3 text-sm font-bold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {loading ? <RefreshCw className="animate-spin" size={18} /> : (
                  <>
                    <span>Masuk Sekarang</span>
                    <LogIn size={16} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center pt-5 border-t border-neutral-800">
              <p className="text-xs text-neutral-500 font-bold uppercase">
                Belum menjadi bagian VIP?{' '}
                <Link href="/register" className="text-yellow-500 hover:text-yellow-400 transition normal-case">
                  Daftar Member
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Panel Gambar Visual Kripto Premium — sticky agar tidak ikut scroll */}
      <div className="hidden lg:flex sticky top-0 h-screen relative overflow-hidden items-center justify-center bg-neutral-900 border-l border-neutral-800">
        {/* Gambar background premium */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-105"
          style={{ backgroundImage: `url('/crypto_login.png')` }}
        />
        {/* Overlay gelap mewah untuk menyatukan gambar dengan tema website */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/40" />
        
        {/* Glow efek tambahan */}
        <div className="absolute top-1/4 right-1/4 w-[300px] h-[300px] bg-yellow-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Konten Text Promosi di atas gambar dibungkus glassmorphism kokoh */}
        <div className="relative z-10 max-w-lg mx-6 p-8 md:p-10 rounded-3xl bg-neutral-950/75 border border-neutral-800/80 backdrop-blur-md text-center shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
          <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-xs font-bold tracking-widest uppercase">
            Platform Crypto Terpercaya
          </div>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight mb-4 tracking-tight uppercase">
            KUASAI PASAR DENGAN <br />
            <span className="bg-linear-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">
              SINYAL AKURAT
            </span>
          </h2>
          <p className="text-neutral-300 text-sm md:text-base leading-relaxed max-w-md mx-auto">
            Bergabunglah dengan ribuan trader elit Imperium Crypto. Dapatkan analisis premium, sinyal real-time, dan strategi profit konsisten setiap hari.
          </p>
        </div>
      </div>
    </div>
  )
}