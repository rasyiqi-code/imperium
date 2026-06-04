'use client'

import { useState, useEffect, Suspense } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Lock, Eye, EyeOff, RefreshCw, AlertTriangle, ArrowRight } from 'lucide-react'
import { useModal } from '@/components/ModalProvider'
import Loader from '@/components/Loader'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { showAlert } = useModal()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [verifying, setVerifying] = useState(true)
  const [isTokenValid, setIsTokenValid] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Verifikasi token pemulihan saat komponen dimuat
  useEffect(() => {
    let active = true
    async function verifyResetToken() {
      try {
        const code = searchParams.get('code')
        if (code) {
          // Alur PKCE: Tukar kode dari query param dengan sesi aktif
          const { error } = await supabase.auth.exchangeCodeForSession(code)
          if (error) {
            console.error('Gagal menukar kode sesi:', error)
            if (active) setIsTokenValid(false)
          } else {
            if (active) setIsTokenValid(true)
          }
        } else {
          // Alur Implicit: Cek apakah sesi pemulihan sudah disetel di client
          const { data: { session } } = await supabase.auth.getSession()
          if (session) {
            if (active) setIsTokenValid(true)
          } else {
            if (active) setIsTokenValid(false)
          }
        }
      } catch (err) {
        console.error('Kesalahan verifikasi token:', err)
        if (active) setIsTokenValid(false)
      } finally {
        if (active) setVerifying(false)
      }
    }

    verifyResetToken()
    return () => {
      active = false
    }
  }, [searchParams])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validasi kecocokan sandi
    if (password !== confirmPassword) {
      setErrorMsg('Password dan konfirmasi password tidak cocok.')
      return
    }

    // Validasi panjang sandi minimal
    if (password.length < 6) {
      setErrorMsg('Password minimal harus terdiri dari 6 karakter.')
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      // Memperbarui password pengguna saat ini
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      // Keluar sesi agar bersih sebelum login ulang dengan kredensial baru
      await supabase.auth.signOut()

      showAlert({
        title: 'Password Diperbarui',
        message: 'Password Anda telah berhasil diubah! Silakan masuk menggunakan password baru Anda.',
        type: 'success',
        confirmText: 'Masuk Sekarang',
        onConfirm: () => {
          router.push('/login')
        }
      })
    } catch (err: unknown) {
      const errorResponse = err as { message?: string }
      console.error('RESET PASSWORD ERROR:', errorResponse)
      setErrorMsg(errorResponse.message || 'Gagal memperbarui password. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  if (verifying) {
    return <Loader label="Memverifikasi Tautan Pemulihan..." fullScreen={true} />
  }

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-neutral-950 text-white font-sans">
      {/* Kolom Kiri: Formulir Reset Password */}
      <div className="flex flex-col justify-center items-center px-6 md:px-12 py-12 relative overflow-hidden">
        {/* Dekorasi latar belakang bercahaya */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-yellow-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-amber-600/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <Image 
                src="/logo.webp" 
                alt="Imperium Crypto Logo" 
                width={180}
                height={48}
                className="object-contain"
                style={{ height: '3rem', width: 'auto' }}
              />
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight uppercase">
              RESET <span className="bg-linear-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">PASSWORD</span>
            </h1>
            <p className="text-neutral-500 text-xs mt-2">Buat kata sandi baru untuk mengamankan akun Anda.</p>
          </div>

          <div className="rounded-3xl bg-neutral-900/50 p-6 md:p-7 shadow-2xl border border-neutral-800 backdrop-blur-xl">
            {!isTokenValid ? (
              <div className="space-y-6 text-center py-4">
                <div className="inline-flex p-3 bg-red-500/10 rounded-full border border-red-500/20 text-red-500 mb-2 animate-pulse">
                  <AlertTriangle size={32} />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Tautan Tidak Valid</h2>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  Tautan pemulihan kata sandi tidak valid atau telah kedaluwarsa. Silakan minta tautan baru dari halaman Lupa Password.
                </p>
                <div className="pt-4">
                  <Link 
                    href="/forgot-password" 
                    className="inline-flex items-center gap-2 rounded-2xl bg-linear-to-r from-yellow-400 to-amber-500 p-3 px-6 text-xs font-bold text-black transition hover:scale-[1.02]"
                  >
                    <span>Minta Tautan Baru</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                {/* Input Password Baru */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 tracking-widest ml-1 uppercase">
                    Password Baru
                  </label>
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

                {/* Input Konfirmasi Password */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 tracking-widest ml-1 uppercase">
                    Konfirmasi Password Baru
                  </label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={16} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      className="w-full rounded-2xl bg-neutral-950 p-3 pl-11 pr-11 text-sm text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
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
                      <span>Simpan Password Baru</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Sisi Kanan: Panel Gambar Visual Kripto Premium — sticky agar tidak ikut scroll */}
      <div className="hidden lg:flex sticky top-0 h-screen relative overflow-hidden items-center justify-center bg-neutral-900 border-l border-neutral-800">
        {/* Gambar background premium */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-10000 hover:scale-105"
          style={{ backgroundImage: `url('/crypto_login.webp')` }}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<Loader label="Menyiapkan Konfirmasi..." fullScreen={true} />}>
      <ResetPasswordContent />
    </Suspense>
  )
}
