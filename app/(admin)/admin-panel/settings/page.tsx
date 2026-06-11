'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useModal } from '@/components/ModalProvider'
import { 
  Bell, Lock, Globe, LogOut, Smartphone, Mail, UserPlus
} from 'lucide-react'
import Loader from '@/components/Loader'

import SettingItem from '@/components/admin/settings/SettingItem'
import SystemConfigToggle from '@/components/admin/settings/SystemConfigToggle'
import PaymentChannelsList from '@/components/admin/settings/PaymentChannelsList'
import ResendSettingsForm from '@/components/admin/settings/ResendSettingsForm'
import MidtransSettingsForm from '@/components/admin/settings/MidtransSettingsForm'
import DiscordSettingsForm from '@/components/admin/settings/DiscordSettingsForm'
import MarketApiSettingsForm from '@/components/admin/settings/MarketApiSettingsForm'
import AddAdminForm from '@/components/admin/settings/AddAdminForm'
import UpdateEmailForm from '@/components/admin/settings/UpdateEmailForm'
import UpdatePasswordForm from '@/components/admin/settings/UpdatePasswordForm'
import ManualPaymentSettingsForm from '@/components/admin/settings/ManualPaymentSettingsForm'

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
  const [midtransUseSnap, setMidtransUseSnap] = useState(false)
  const [enabledPayments, setEnabledPayments] = useState<string[]>([])

  const [discordApplicationId, setDiscordApplicationId] = useState('')
  const [discordClientSecret, setDiscordClientSecret] = useState('')
  const [discordBotToken, setDiscordBotToken] = useState('')
  const [discordVipServerId, setDiscordVipServerId] = useState('')
  const [discordVipRoleId, setDiscordVipRoleId] = useState('')
  const [discordFreeInviteLink, setDiscordFreeInviteLink] = useState('')
  const [discordRedirectUri, setDiscordRedirectUri] = useState('')
  // State untuk API key data pasar
  const [freecryptoapiKey, setFreecryptoapiKey] = useState('')
  const [coinmarketcapApiKey, setCoinmarketcapApiKey] = useState('')
  // State untuk rekening manual
  const [manualBankName, setManualBankName] = useState('')
  const [manualAccountNumber, setManualAccountNumber] = useState('')
  const [manualAccountName, setManualAccountName] = useState('')

  const [activeTab, setActiveTab] = useState<'general' | 'payments' | 'midtrans' | 'discord' | 'resend' | 'market' | 'manual'>('general')
  const currentTab = (midtransUseSnap && activeTab === 'payments') ? 'general' : activeTab
  const [isPasswordFormOpen, setIsPasswordFormOpen] = useState(false)
  const [activeSessionsCount, setActiveSessionsCount] = useState(1)
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [isEmailFormOpen, setIsEmailFormOpen] = useState(false)

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
          if (typeof data.activeSessionsCount === 'number') {
            setActiveSessionsCount(data.activeSessionsCount)
          }
          setResendApiKey(settings.resend_api_key || '')
          setResendSenderEmail(settings.resend_sender_email || '')
          setMidtransClientKey(settings.midtrans_client_key || '')
          setMidtransServerKey(settings.midtrans_server_key || '')
          setMidtransPublicKey(settings.midtrans_public_key || '')
          setMidtransIsProduction(!!settings.midtrans_is_production)
          setMidtransUpgradeMode(settings.midtrans_upgrade_mode || 'stacking')
          setMidtransUseSnap(!!settings.midtrans_use_snap)
          setEnabledPayments(Array.isArray(settings.midtrans_enabled_payments) ? settings.midtrans_enabled_payments : [])

          setDiscordApplicationId(settings.discord_application_id || '')
          setDiscordClientSecret(settings.discord_client_secret || '')
          setDiscordBotToken(settings.discord_bot_token || '')
          setDiscordVipServerId(settings.discord_vip_server_id || '')
          setDiscordVipRoleId(settings.discord_vip_role_id || '')
          setDiscordFreeInviteLink(settings.discord_free_invite_link || '')
          setDiscordRedirectUri(settings.discord_redirect_uri || '')
          // Inisialisasi API key pasar
          setFreecryptoapiKey(settings.freecryptoapi_key || '')
          setCoinmarketcapApiKey(settings.coinmarketcap_api_key || '')
          // Inisialisasi rekening manual
          setManualBankName(settings.manual_bank_name || '')
          setManualAccountNumber(settings.manual_account_number || '')
          setManualAccountName(settings.manual_account_name || '')
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

  const handlePasswordUpdate = async (newPass: string, currentPass: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPass,
        current_password: currentPass
      })

      if (error) {
        showAlert({
          title: 'Gagal Mengubah Password',
          message: error.message || 'Terjadi kesalahan saat memperbarui password.',
          type: 'danger'
        })
        return false
      } else {
        showAlert({
          title: 'Password Diperbarui',
          message: 'Password admin berhasil diperbarui!',
          type: 'success'
        })
        return true
      }
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Error',
        message: `Gagal: ${error.message}`,
        type: 'danger'
      })
      return false
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
            setActiveSessionsCount(1)
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

  const handleCreateAdmin = async (email: string, pass: string, name: string, wa: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createAdminUser',
          email,
          password: pass,
          fullName: name,
          whatsappNumber: wa
        })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        showAlert({
          title: 'Admin Berhasil Dibuat',
          message: 'Akun administrator baru berhasil didaftarkan!',
          type: 'success'
        })
        return true
      } else {
        showAlert({
          title: 'Gagal Membuat Admin',
          message: data.error || 'Terjadi kesalahan saat membuat admin baru.',
          type: 'danger'
        })
        return false
      }
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Error',
        message: `Gagal: ${error.message}`,
        type: 'danger'
      })
      return false
    }
  }

  const handleEmailUpdate = async (newEmail: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showAlert({
          title: 'Sesi Habis',
          message: 'Sesi Anda telah habis. Silakan login kembali.',
          type: 'danger'
        })
        return false
      }

      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'updateAdminEmail',
          adminUserId: user.id,
          newEmail
        })
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setAdminEmail(newEmail)
        showAlert({
          title: 'Email Diperbarui',
          message: 'Email admin berhasil diperbarui!',
          type: 'success'
        })
        return true
      } else {
        showAlert({
          title: 'Gagal Mengubah Email',
          message: data.error || 'Terjadi kesalahan saat memperbarui email.',
          type: 'danger'
        })
        return false
      }
    } catch (err: unknown) {
      const error = err as Error
      showAlert({
        title: 'Error',
        message: `Gagal: ${error.message}`,
        type: 'danger'
      })
      return false
    }
  }

  // Pengaturan rekening manual dipindahkan ke component terpisah

  if (loading) return <Loader label="Memuat Kredensial & Pengaturan..." />

  return (
    <div className="p-3 md:p-8 space-y-4 md:space-y-6 w-full pb-32 bg-transparent text-white font-sans text-left text-xs md:text-sm animate-in fade-in duration-300">
      
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
            currentTab === 'general'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Umum & Sistem
        </button>
        {!midtransUseSnap && (
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
              currentTab === 'payments'
                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
            }`}
          >
            Metode Pembayaran
          </button>
        )}
        <button
          onClick={() => setActiveTab('manual')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            currentTab === 'manual'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Rekening Manual
        </button>
        <button
          onClick={() => setActiveTab('midtrans')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            currentTab === 'midtrans'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Kredensial Midtrans
        </button>
        <button
          onClick={() => setActiveTab('discord')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            currentTab === 'discord'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Kredensial Discord
        </button>
        <button
          onClick={() => setActiveTab('resend')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            currentTab === 'resend'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          Kredensial Resend
        </button>
        <button
          onClick={() => setActiveTab('market')}
          className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            currentTab === 'market'
              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/10'
              : 'text-neutral-400 hover:text-white hover:bg-neutral-900/50'
          }`}
        >
          API Data Pasar
        </button>
      </div>

      {/* Tab Contents */}
      <div className="w-full">
        {currentTab === 'general' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Profile Header / Tambah Admin Baru */}
            {isAddAdminOpen ? (
              <AddAdminForm 
                onClose={() => setIsAddAdminOpen(false)} 
                onCreateAdmin={handleCreateAdmin} 
              />
            ) : (
              <div className="p-6 rounded-2xl bg-neutral-950/30 backdrop-blur-md border border-neutral-800 flex items-center justify-between gap-4 shadow-lg">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 bg-yellow-500 rounded-xl flex items-center justify-center text-black font-black text-xl uppercase leading-none shrink-0">
                    {adminEmail ? adminEmail.substring(0, 2) : 'AD'}
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-xs font-black text-white leading-none">Super Admin</h2>
                    <p className="text-[10px] text-neutral-500 font-bold mt-2 tracking-tight truncate">{adminEmail || 'admin@imperium.com'}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsAddAdminOpen(true)}
                  className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-black rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-lg shadow-yellow-500/10"
                >
                  <UserPlus size={12} /> Tambah Admin
                </button>
              </div>
            )}

            {/* Keamanan Admin */}
            <div className="space-y-3">
              <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Keamanan Admin</h3>
              <div className="bg-neutral-950/30 backdrop-blur-md border border-neutral-800 rounded-2xl overflow-hidden divide-y divide-neutral-900/60 shadow-lg">
                {isEmailFormOpen ? (
                  <UpdateEmailForm 
                    currentEmail={adminEmail} 
                    onClose={() => setIsEmailFormOpen(false)} 
                    onUpdateEmail={handleEmailUpdate} 
                  />
                ) : (
                  <div onClick={() => setIsEmailFormOpen(true)} className="cursor-pointer">
                    <SettingItem icon={<Mail size={14}/>} title="Email Utama" value={adminEmail} isLink linkText="Ubah" />
                  </div>
                )}
                
                {isPasswordFormOpen ? (
                  <UpdatePasswordForm 
                    onClose={() => setIsPasswordFormOpen(false)} 
                    onUpdatePassword={handlePasswordUpdate} 
                  />
                ) : (
                  <div onClick={() => setIsPasswordFormOpen(true)} className="cursor-pointer">
                    <SettingItem icon={<Lock size={14}/>} title="Update Password" value="Amankan akun secara berkala" isLink />
                  </div>
                )}

                <div onClick={handleManageDevices} className="cursor-pointer">
                  <SettingItem icon={<Smartphone size={14}/>} title="Device Terdaftar" value={`${activeSessionsCount} Perangkat Aktif`} isLink linkText="Kelola" />
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

        {currentTab === 'manual' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Pengaturan Rekening Manual</h3>
            <ManualPaymentSettingsForm
              initialBankName={manualBankName}
              initialAccountNumber={manualAccountNumber}
              initialAccountName={manualAccountName}
            />
          </div>
        )}

        {currentTab === 'payments' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Metode Pembayaran Aktif</h3>
            <PaymentChannelsList initialEnabledPayments={enabledPayments} />
          </div>
        )}

        {currentTab === 'midtrans' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Integrasi Kredensial Midtrans</h3>
            <MidtransSettingsForm 
              initialClientKey={midtransClientKey}
              initialServerKey={midtransServerKey}
              initialPublicKey={midtransPublicKey}
              initialIsProduction={midtransIsProduction}
              initialUpgradeMode={midtransUpgradeMode}
              initialUseSnap={midtransUseSnap}
            />
          </div>
        )}

        {currentTab === 'discord' && (
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

        {currentTab === 'resend' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Integrasi Resend Email</h3>
            <ResendSettingsForm initialApiKey={resendApiKey} initialSenderEmail={resendSenderEmail} />
          </div>
        )}

        {currentTab === 'market' && (
          <div className="space-y-3 animate-in fade-in duration-200">
            <h3 className="text-xs font-black text-neutral-500 tracking-widest px-1">Konfigurasi API Data Pasar</h3>
            <MarketApiSettingsForm
              initialFreecryptoapiKey={freecryptoapiKey}
              initialCoinmarketcapApiKey={coinmarketcapApiKey}
            />
          </div>
        )}
      </div>

      {/* Logout Button */}
      <div className="pt-4 w-full">
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