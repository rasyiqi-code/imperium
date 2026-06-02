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
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-yellow-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-600/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative">
        <div className="text-center mb-10">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-900 border border-neutral-800 mb-4 shadow-2xl">
            <LogIn className="text-yellow-500" size={32} />
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Welcome <span className="bg-linear-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">Back</span>
          </h1>
          <p className="text-neutral-500 text-sm mt-3">Masuk ke portal eksklusif Imperium Crypto.</p>
        </div>

        <div className="rounded-3xl bg-neutral-900/50 p-8 shadow-2xl border border-neutral-800 backdrop-blur-xl">
          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest ml-1">
                Your Email
              </label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input
                  type="email"
                  className="w-full rounded-2xl bg-neutral-950 p-4 pl-12 text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  Password
                </label>
                <a href="https://wa.me/62812345678?text=Halo%20Admin,%20saya%20lupa%20password%20akun%20Imperium%20Crypto%20saya" target="_blank" className="text-xs text-yellow-500/70 hover:text-yellow-500 font-bold uppercase tracking-widest transition">
                  Lupa?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-2xl bg-neutral-950 p-4 pl-12 pr-12 text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
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
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="rounded-xl bg-red-950/20 border border-red-900/50 p-3 text-center text-xs text-red-400 animate-pulse">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-yellow-400 to-amber-500 p-4 font-bold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50 overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              {loading ? <RefreshCw className="animate-spin" size={20} /> : (
                <>
                  <span>Masuk Sekarang</span>
                  <LogIn size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-neutral-800">
            <p className="text-sm text-neutral-500 font-bold">
              Belum menjadi bagian VIP?{' '}
              <Link href="/register" className="text-yellow-500 hover:text-yellow-400 transition">
                Daftar Member
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}