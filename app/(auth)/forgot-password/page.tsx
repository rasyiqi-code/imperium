'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import Image from 'next/image'
import { Mail, RefreshCw, ArrowLeft, CheckCircle2 } from 'lucide-react'
import HCaptcha from '@hcaptcha/react-hcaptcha'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const captchaRef = useRef<HCaptcha>(null)

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    let token = ''
    try {
      // Jalankan verifikasi captcha secara asinkronus (invisible)
      const captchaResponse = await captchaRef.current?.execute({ async: true })
      token = captchaResponse?.response || ''
    } catch (err) {
      console.error('Error executing captcha:', err)
    }

    if (!token) {
      setErrorMsg('Gagal: Selesaikan verifikasi captcha terlebih dahulu.')
      setLoading(false)
      return
    }

    try {
      // Mengirim email pemulihan kata sandi menggunakan Supabase Auth (Client-side) dengan menyertakan token captcha
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
        captchaToken: token
      })

      if (error) throw error

      setSuccessMsg('Tautan pemulihan kata sandi berhasil dikirim! Silakan periksa kotak masuk atau folder spam email Anda.')
    } catch (err: unknown) {
      const errorResponse = err as { message?: string }
      console.error('FORGOT PASSWORD ERROR:', errorResponse)
      setErrorMsg(errorResponse.message || 'Gagal mengirim email pemulihan. Pastikan email terdaftar.')
      captchaRef.current?.resetCaptcha() // Reset captcha jika terjadi kesalahan
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-neutral-950 text-white font-sans">
      {/* Kolom Kiri: Formulir Lupa Password */}
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
              LUPA <span className="bg-linear-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">PASSWORD</span>
            </h1>
            <p className="text-neutral-500 text-xs mt-2">Masukkan email Anda untuk memulihkan akses akun.</p>
          </div>

          <div className="rounded-3xl bg-neutral-900/50 p-6 md:p-7 shadow-2xl border border-neutral-800 backdrop-blur-xl">
            {successMsg ? (
              <div className="space-y-6 text-center py-4">
                <div className="inline-flex p-3 bg-green-500/10 rounded-full border border-green-500/20 text-green-500 mb-2">
                  <CheckCircle2 size={32} />
                </div>
                <h2 className="text-lg font-bold text-white uppercase tracking-wider">Email Terkirim</h2>
                <p className="text-neutral-400 text-xs leading-relaxed">
                  {successMsg}
                </p>
                <div className="pt-4">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-yellow-500 hover:text-yellow-400 transition"
                  >
                    <ArrowLeft size={16} />
                    <span>Kembali ke Halaman Login</span>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleResetRequest} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-neutral-400 tracking-widest ml-1 uppercase">
                    Email Terdaftar
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
                      <span>Kirim Tautan Pemulihan</span>
                    </>
                  )}
                </button>
                
                <div className="mt-6 text-center pt-5 border-t border-neutral-800">
                  <Link 
                    href="/login" 
                    className="inline-flex items-center gap-2 text-xs text-neutral-500 hover:text-white transition uppercase font-bold tracking-wider"
                  >
                    <ArrowLeft size={14} />
                    <span>Kembali ke Login</span>
                  </Link>
                </div>

                {/* Komponen hCaptcha invisible untuk proteksi bot */}
                <HCaptcha
                  ref={captchaRef}
                  sitekey={process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY!}
                  size="invisible"
                  onVerify={(token) => console.log('Captcha terverifikasi:', token)}
                  onExpire={() => captchaRef.current?.resetCaptcha()}
                />
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
