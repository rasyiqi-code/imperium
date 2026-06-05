'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/components/ModalProvider'
import { 
  Bell, Lock, Globe, LogOut, Smartphone, Mail, RefreshCw
} from 'lucide-react'
import Loader from '@/components/Loader'

import SettingItem from '@/components/admin/settings/SettingItem'
import SystemConfigToggle from '@/components/admin/settings/SystemConfigToggle'
import PaymentChannelsList from '@/components/admin/settings/PaymentChannelsList'
import ResendSettingsForm from '@/components/admin/settings/ResendSettingsForm'
import MidtransSettingsForm from '@/components/admin/settings/MidtransSettingsForm'
import DiscordSettingsForm from '@/components/admin/settings/DiscordSettingsForm'

export default function AdminSettings() {
  const { showAlert, showConfirm } = useModal()
  const [loading, setLoading] = useState(true)
  const [adminEmail, setAdminEmail] = useState('')

  // Simpan nilai awal settings dari database
  const [resendApiKey, setResendApiKey] = useState('')
  const [resendSenderEmail, setResendSenderEmail] = useState('')

  const [midtransClientKey, setMidtransClientKey] = useState('')
  const [midtransServerKey, setMidtransServerKey] = useState('')
  const [midtransPublicKey, setMidtransPublicKey] = useState('')
  const [midtransIsProduction, setMidtransIsProduction] = useState(false)
  const [midtransUpgradeMode, setMidtransUpgradeMode] = useState('stacking')
  const [enabledPayments, setEnabledPayments] = useState<string[]>([])

  const [discordApplicationId, setDiscordApplicationId] = useState('')
  const [discordClientSecret, setDiscordClientSecret] = useState('')
  const [discordBotToken, setDiscordBotToken] = useState('')
  const [discordVipServerId, setDiscordVipServerId] = useState('')
  const [discordVipRoleId, setDiscordVipRoleId] = useState('')
  const [discordFreeInviteLink, setDiscordFreeInviteLink] = useState('')
  const [discordRedirectUri, setDiscordRedirectUri] = useState('')
  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'midtrans' | 'discord' | 'resend'>('general')
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordUpdating, setPasswordUpdating] = useState(false)

  useEffect(() => {
    let active = true
    async function initSettings() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!active) return
      if (user?.email) setAdminEmail(user.email)

      try {
        const res = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getAdminSettings' })
        })
        const data = await res.json()
        if (!active) return
        if (res.ok && data.settings) {
          const settings = data.settings
          setResendApiKey(settings.resend_api_key || '')
          setResendSenderEmail(settings.resend_sender_email || '')
          setMidtransClientKey(settings.midtrans_client_key || '')
          setMidtransServerKey(settings.midtrans_server_key || '')
          setMidtransPublicKey(settings.midtrans_public_key || '')
          setMidtransIsProduction(!!settings.midtrans_is_production)
          setMidtransUpgradeMode(settings.midtrans_upgrade_mode || 'stacking')
          setEnabledPayments(Array.isArray(settings.midtrans_enabled_payments) ? settings.midtrans_enabled_payments : [])

          setDiscordApplicationId(settings.discord_application_id || '')
          setDiscordClientSecret(settings.discord_client_secret || '')
          setDiscordBotToken(settings.discord_bot_token || '')
          setDiscordVipServerId(settings.discord_vip_server_id || '')
          setDiscordVipRoleId(settings.discord_vip_role_id || '')
          setDiscordFreeInviteLink(settings.discord_free_invite_link || '')
          setDiscordRedirectUri(settings.discord_redirect_uri || '')
        }
      } catch (err) {
        console.error('Gagal mengambil settings:', err)
      } finally {
        if (active) setLoading(false)
      }
    }
    
    const timer = setTimeout(() => {
      initSettings()
    }, 0)
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [])

  const handleLogout = () => {
    showConfirm({
      title: 'Keluar Admin Panel',
      message: 'Apakah Anda yakin ingin keluar dari Admin Panel?',
      type: 'warning',
      confirmText: 'Keluar',
      cancelText: 'Batal',
      onConfirm: async () => {
        await supabase.auth.signOut()
        window.location.href = '/login'
      }
    })
  }

  const handlePasswordUpdate = async () => {
    if (newPassword.length < 6) {
      showAlert({
        title: 'Password Terlalu Pendek',
        message: 'Password baru harus minimal 6 karakter.',
        type: 'warning'
      })
      return
    }
    if (newPassword !== confirmPassword) {
      showAlert({
        title: 'Password Tidak Cocok',
        message: 'Konfirmasi password tidak cocok dengan password baru.',
        type: 'warning'
      })
      return
    }

    setPasswordUpdating(true)
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        showAlert({
          title: 'Gagal Mengubah Password',
          message: error.message || 'Terjadi kesalahan saat memperbarui password.',
          type: 'danger'
        })
      } else {
        setNewPassword('')
        setConfirmPassword('')
        setIsPasswordFormOpen(false)
        showAlert({
          title: 'Password Diperbarui',
          message: 'Password admin berhasil diperbarui!',
          type: 'success'
        })
      }
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Error',
        message: `Gagal: ${error.message}`,
        type: 'danger'
      })
    } finally {
      setPasswordUpdating(false)
    }
  }

  const handleManageDevices = () => {
    if (typeof window === 'undefined') return

    const ua = navigator.userAgent
    let os = 'OS Lain'
    let browser = 'Browser Lain'

    if (ua.includes('Windows')) os = 'Windows'
    else if (ua.includes('Macintosh') || ua.includes('Mac OS')) os = 'macOS'
    else if (ua.includes('Linux')) os = 'Linux'
    else if (ua.includes('Android')) os = 'Android'
    else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iOS'

    if (ua.includes('Chrome')) browser = 'Chrome'
    else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari'
    else if (ua.includes('Firefox')) browser = 'Firefox'
    else if (ua.includes('Edge') || ua.includes('Edg')) browser = 'Edge'

    const deviceInfo = `${browser} di ${os}`

    showConfirm({
      title: 'Perangkat Terdaftar',
      message: `Perangkat aktif Anda saat ini:\n• ${deviceInfo} (Perangkat Ini)\n\nApakah Anda ingin keluar dari semua perangkat lain yang terhubung dengan akun admin ini?`,
      type: 'warning',
      confirmText: 'Ya, Logout Lainnya',
      cancelText: 'Tutup',
      onConfirm: async () => {
        try {
          const { error } = await supabase.auth.signOut({ scope: 'others' })
          if (error) {
            showAlert({
              title: 'Gagal Logout',
              message: error.message,
              type: 'danger'
            })
          } else {
            showAlert({
              title: 'Logout Berhasil',
              message: 'Berhasil keluar dari semua perangkat lainnya.',
              type: 'success'
            })
          }
        } catch (err: unknown) {
          const error = err as Error
          showAlert({
            title: 'Error',
            message: `Gagal: ${error.message}`,
            type: 'danger'
          })
        }
      }
    })
  }

  if (loading) return <Loader label="Memuat Kredensial & Pengaturan..." />

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 max-w-5xl mx-auto pb-32 bg-transparent text-white font-sans text-left text-xs md:text-sm animate-in fade-in duration-300">
      
      {/* Title */}
      <div className="hidden md:block border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">System <span className="text-yellow-500">Settings</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Kelola keamanan admin, konfigurasi notifikasi, dan integrasi pihak ketiga</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-800 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'general'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Umum & Sistem
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'payments'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Metode Pembayaran
        </button>
        <button
          onClick={() => setActiveTab('midtrans')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'midtrans'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Kredensial Midtrans
        </button>
        <button
          onClick={() => setActiveTab('discord')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'discord'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Kredensial Discord
        </button>
        <button
          onClick={() => setActiveTab('resend')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === 'resend'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Kredensial Resend
        </button>
      </div>

      {/* Tab Contents */}
      <div className="max-w-4xl">
        {activeTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Profile Header */}
            <div className="p-6 rounded-2xl bg-neutral-950/30 backdrop-blur-md border border-neutral-800 flex items-center gap-4 shadow-lg">
              <div className="h-14 w-14 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black text-xl uppercase leading-none shrink-0">
                {adminEmail ? adminEmail.substring(0, 2) : 'AD'}
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-black text-white leading-none">Super Admin</h2>
                <p className="text-[10px] text-neutral-500 font-bold mt-2 tracking-tight truncate">{adminEmail || 'admin@imperium.com'}</p>
              </div>
            </div>

            {/* Keamanan Admin */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Keamanan Admin</h3>
              <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-900/60 shadow-lg">
                <SettingItem icon={<Mail size={14}/>} title="Email Utama" value={adminEmail} />
                
                {isPasswordFormOpen ? (
                  <div className="p-4 bg-neutral-900/25 border border-neutral-900 rounded-2xl m-3 space-y-3.5 animate-in zoom-in-95 duration-200 text-left">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Password Baru</label>
                      <input
                        type="password"
                        placeholder="Masukkan password baru (Min. 6 karakter)..."
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-2.5 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all font-mono"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        disabled={passwordUpdating}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-neutral-400 tracking-widest uppercase">Konfirmasi Password Baru</label>
                      <input
                        type="password"
                        placeholder="Ulangi password baru..."
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-yellow-500/50 p-2.5 rounded-xl text-white text-xs outline-none font-bold focus:ring-2 ring-yellow-500/20 transition-all font-mono"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={passwordUpdating}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 mt-1">
                      <button
                        onClick={() => {
                          setIsPasswordFormOpen(false)
                          setNewPassword('')
                          setConfirmPassword('')
                        }}
                        disabled={passwordUpdating}
                        className="w-full bg-neutral-900 border border-neutral-850 hover:bg-neutral-800 text-neutral-400 hover:text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer text-center"
                      >
                        Batal
                      </button>
                      <button
                        onClick={handlePasswordUpdate}
                        disabled={passwordUpdating || newPassword.length < 6 || confirmPassword.length < 6}
                        className="w-full bg-yellow-500 hover:bg-yellow-400 disabled:bg-neutral-850 text-black disabled:text-neutral-500 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer disabled:cursor-not-allowed text-center flex items-center justify-center gap-1.5"
                      >
                        {passwordUpdating ? <RefreshCw className="animate-spin" size={12} /> : 'Simpan'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div onClick={() => setIsPasswordFormOpen(true)} className="cursor-pointer">
                    <SettingItem icon={<Lock size={14}/>} title="Update Password" value="Amankan akun secara berkala" isLink />
                  </div>
                )}

                <div onClick={handleManageDevices} className="cursor-pointer">
                  <SettingItem icon={<Smartphone size={14}/>} title="Device Terdaftar" value="1 Perangkat Aktif" isLink linkText="Kelola" />
                </div>
              </div>
            </div>

            {/* Konfigurasi Sistem */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Konfigurasi Sistem</h3>
              <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl p-5 space-y-5 shadow-lg">
                <SystemConfigToggle 
                  icon={<Bell size={14}/>} 
                  title="Notifikasi Email" 
                  desc="Kirim notif ke email setiap ada transfer" 
                  dbField="email_notif_active" 
                />
                <SystemConfigToggle 
                  icon={<Globe size={14}/>} 
                  title="Maintenance Mode" 
                  desc="Tutup akses website sementara" 
                  dbField="maintenance_mode" 
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'payments' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Metode Pembayaran Aktif</h3>
            <PaymentChannelsList initialEnabledPayments={enabledPayments} />
          </div>
        )}

        {activeTab === 'midtrans' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Integrasi Kredensial Midtrans</h3>
            <MidtransSettingsForm 
              initialClientKey={midtransClientKey}
              initialServerKey={midtransServerKey}
              initialPublicKey={midtransPublicKey}
              initialIsProduction={midtransIsProduction}
              initialUpgradeMode={midtransUpgradeMode}
            />
          </div>
        )}

        {activeTab === 'discord' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Integrasi Kredensial Discord</h3>
            <DiscordSettingsForm 
              initialApplicationId={discordApplicationId}
              initialClientSecret={discordClientSecret}
              initialBotToken={discordBotToken}
              initialVipServerId={discordVipServerId}
              initialVipRoleId={discordVipRoleId}
              initialFreeInviteLink={discordFreeInviteLink}
              initialRedirectUri={discordRedirectUri}
            />
          </div>
        )}

        {activeTab === 'resend' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Integrasi Resend Email</h3>
            <ResendSettingsForm initialApiKey={resendApiKey} initialSenderEmail={resendSenderEmail} />
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="pt-4 max-w-4xl">
        <button 
          onClick={handleLogout} 
          className="w-full py-4 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl text-xs font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-red-500 hover:text-white hover:border-red-400 hover:shadow-lg hover:shadow-red-500/10 transition-all active:scale-95 duration-300 cursor-pointer"
        >
          <LogOut size={16} /> Keluar Aplikasi
        </button>
      </div>
    </div>
  )
}