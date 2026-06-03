'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Send, Mail, Clock, ChevronDown, ChevronUp } from 'lucide-react'
import Loader from '@/components/Loader'

interface SupportConfig {
  whatsapp_number: string
  telegram_link: string
  support_email: string
  operational_hours: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  sort_order: number
}

export default function SupportPage() {
  const [config, setConfig] = useState<SupportConfig | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  // State untuk FAQ accordion — menyimpan id FAQ yang sedang terbuka
  const [openFaq, setOpenFaq] = useState<string | null>(null)

  useEffect(() => {
    async function loadSupport() {
      try {
        const res = await fetch('/api/user/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getSupportPageData' })
        })
        const data = await res.json()
        
        if (res.ok) {
          if (data.config) setConfig(data.config)
          if (data.faqs) setFaqs(data.faqs)
        }
      } catch (err) {
        console.error("Gagal memuat data support:", err)
      } finally {
        setLoading(false)
      }
    }
    loadSupport()
  }, [])

  if (loading) return <Loader label="Memuat Bantuan & FAQ..." />

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-7xl mx-auto animate-in fade-in duration-500 text-left">

      {/* ===== Page Header ===== */}
      <div className="border-b border-neutral-800 pb-4 mb-6">
        <h1 className="text-xl font-black uppercase tracking-tight text-white">Support &amp; <span className="text-yellow-500">FAQ</span></h1>
        <p className="text-[10px] text-neutral-500 font-bold mt-1.5 tracking-wider">Hubungi tim kami atau temukan jawaban dari pertanyaan umum.</p>
      </div>

      {/* ===== Grid Kontak ===== */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <ContactCard 
          icon={<MessageSquare size={16} className="text-green-400" />}
          iconBg="bg-green-500/10 border-green-500/20"
          title="WhatsApp"
          desc="Chat admin langsung"
          link={`https://wa.me/${
            config?.whatsapp_number
              ? (config.whatsapp_number.replace(/[^0-9]/g, '').startsWith('0')
                ? '62' + config.whatsapp_number.replace(/[^0-9]/g, '').slice(1)
                : config.whatsapp_number.replace(/[^0-9]/g, ''))
              : ''
          }`}
        />
        <ContactCard 
          icon={<Send size={16} className="text-blue-400" />}
          iconBg="bg-blue-500/10 border-blue-500/20"
          title="Telegram"
          desc="Grup komunitas"
          link={config?.telegram_link}
        />
        <ContactCard 
          icon={<Mail size={16} className="text-yellow-400" />}
          iconBg="bg-yellow-500/10 border-yellow-500/20"
          title="Email"
          desc="Bantuan teknis"
          link={`mailto:${config?.support_email}`}
        />
      </div>

      {/* ===== Jam Operasional ===== */}
      {config?.operational_hours && (
        <div className="flex items-center gap-3 px-4 py-2.5 bg-neutral-900/50 border border-neutral-800 rounded-xl">
          <Clock size={12} className="text-neutral-500 shrink-0" />
          <p className="text-[10px] font-bold text-neutral-500">
            Jam Operasional: <span className="text-neutral-300">{config.operational_hours}</span>
          </p>
        </div>
      )}

      {/* ===== FAQ Accordion ===== */}
      {faqs.length > 0 && (
        <div className="space-y-2">
          <p className="text-[9px] font-bold text-neutral-500 uppercase tracking-widest px-1">Pertanyaan Umum</p>
          <div className="rounded-2xl border border-neutral-800 overflow-hidden divide-y divide-neutral-800/60">
            {faqs.map((faq) => {
              const isOpen = openFaq === faq.id
              return (
                <button
                  key={faq.id}
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full text-left p-4 hover:bg-neutral-900/60 transition-all focus:outline-none group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-xs font-bold text-white leading-relaxed">{faq.question}</p>
                    <span className="text-neutral-500 group-hover:text-neutral-300 transition-colors shrink-0 mt-0.5">
                      {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </span>
                  </div>
                  {isOpen && (
                    <p className="text-[11px] font-medium text-neutral-400 leading-relaxed mt-2.5 pr-6">
                      {faq.answer}
                    </p>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}

// ===== Komponen ContactCard =====
interface ContactCardProps {
  icon: React.ReactNode
  iconBg: string
  title: string
  link?: string
  desc: string
}

function ContactCard({ icon, iconBg, title, link, desc }: ContactCardProps) {
  return (
    <a
      href={link || '#'}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col gap-2.5 p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900 transition-all active:scale-[0.98]"
    >
      <div className={`p-2 rounded-xl border w-fit ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-extrabold text-white">{title}</p>
        <p className="text-[10px] font-bold text-neutral-500 mt-0.5">{desc}</p>
      </div>
    </a>
  )
}