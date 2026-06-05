'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  MessageSquare,
  Plus,
  Trash2,
  Edit3,
  Star,
  Eye,
  EyeOff,
  RefreshCw,
  X,
  User,
  Image as ImageIcon
} from 'lucide-react'
import { useModal } from '@/components/ModalProvider'
import Loader from '@/components/Loader'

interface Testimonial {
  id: string
  nama_user: string
  foto_user: string | null
  peran_user: string | null
  isi_testi: string
  rating: number | null
  status_tampil: boolean | null
  created_at: string | null
}

export default function AdminTestimonialsPage() {
  const { showAlert, showConfirm } = useModal()

  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // State untuk modal form tambah/edit
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // State input form
  const [namaUser, setNamaUser] = useState('')
  const [fotoUser, setFotoUser] = useState('')
  const [peranUser, setPeranUser] = useState('Member')
  const [isiTesti, setIsiTesti] = useState('')
  const [rating, setRating] = useState(5)
  const [statusTampil, setStatusTampil] = useState(true)

  // Fungsi untuk memicu refresh data pasca aksi CRUD
  const loadTestimonials = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'getTestimonials' })
      })
      const data = await res.json()
      if (res.ok) {
        setTestimonials(data)
      } else {
        showAlert({
          title: 'Kesalahan Sistem',
          message: data.error || 'Gagal memuat daftar testimonial.',
          type: 'danger'
        })
      }
    } catch (err) {
      console.error(err)
      showAlert({
        title: 'Koneksi Bermasalah',
        message: 'Gagal terhubung ke server.',
        type: 'danger'
      })
    } finally {
      setLoading(false)
    }
  }, [showAlert])

  // Pengambilan data awal saat komponen di-mount
  useEffect(() => {
    let active = true
    async function initLoad() {
      try {
        const res = await fetch('/api/admin/actions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'getTestimonials' })
        })
        const data = await res.json()
        if (res.ok && active) {
          setTestimonials(data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        if (active) setLoading(false)
      }
    }
    initLoad()
    return () => {
      active = false
    }
  }, [])

  // Buka modal untuk menambah ulasan baru
  const openAddModal = () => {
    setEditingId(null)
    setNamaUser('')
    setFotoUser('')
    setPeranUser('Member')
    setIsiTesti('')
    setRating(5)
    setStatusTampil(true)
    setIsModalOpen(true)
  }

  // Buka modal untuk mengedit ulasan yang sudah ada
  const openEditModal = (t: Testimonial) => {
    setEditingId(t.id)
    setNamaUser(t.nama_user)
    setFotoUser(t.foto_user || '')
    setPeranUser(t.peran_user || 'Member')
    setIsiTesti(t.isi_testi)
    setRating(t.rating || 5)
    setStatusTampil(t.status_tampil ?? true)
    setIsModalOpen(true)
  }

  // Submit handler untuk simpan data (Tambah / Ubah)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!namaUser.trim() || !isiTesti.trim()) {
      showAlert({
        title: 'Validasi Gagal',
        message: 'Nama pengulas dan isi ulasan wajib diisi.',
        type: 'warning'
      })
      return
    }

    setActionLoading(true)
    try {
      const action = editingId ? 'updateTestimonial' : 'addTestimonial'
      const payload = {
        action,
        id: editingId,
        namaUser: namaUser.trim(),
        fotoUser: fotoUser.trim() || undefined,
        peranUser: peranUser.trim() || undefined,
        isiTesti: isiTesti.trim(),
        rating,
        statusTampil
      }

      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()

      if (res.ok && data.success) {
        showAlert({
          title: editingId ? 'Ulasan Diperbarui' : 'Ulasan Ditambahkan',
          message: editingId
            ? 'Data testimonial berhasil disimpan.'
            : 'Testimonial baru sukses dibuat.',
          type: 'success'
        })
        setIsModalOpen(false)
        setLoading(true)
        loadTestimonials()
      } else {
        showAlert({
          title: 'Gagal Menyimpan',
          message: data.error || 'Terjadi kesalahan saat menyimpan data.',
          type: 'danger'
        })
      }
    } catch (err) {
      console.error(err)
      showAlert({
        title: 'Kesalahan Sistem',
        message: 'Gagal menghubungi server.',
        type: 'danger'
      })
    } finally {
      setActionLoading(false)
    }
  }

  // Handler Hapus Testimonial
  const handleDelete = (id: string, name: string) => {
    showConfirm({
      title: 'Hapus Testimonial',
      message: `Apakah Anda yakin ingin menghapus testimonial dari "${name}"? Tindakan ini permanen.`,
      type: 'danger',
      confirmText: 'Hapus',
      cancelText: 'Batal',
      onConfirm: async () => {
        setActionLoading(true)
        try {
          const res = await fetch('/api/admin/actions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'deleteTestimonial', id })
          })
          const data = await res.json()
          if (res.ok && data.success) {
            showAlert({
              title: 'Berhasil Dihapus',
              message: 'Testimonial telah dihapus dari sistem.',
              type: 'success'
            })
            setLoading(true)
            loadTestimonials()
          } else {
            showAlert({
              title: 'Gagal Menghapus',
              message: data.error || 'Tidak dapat menghapus ulasan.',
              type: 'danger'
            })
          }
        } catch (err) {
          console.error(err)
          showAlert({
            title: 'Kesalahan',
            message: 'Gagal terhubung ke server.',
            type: 'danger'
          })
        } finally {
          setActionLoading(false)
        }
      }
    })
  }

  // Handler toggle status tampil secara instan
  const handleToggleStatus = async (id: string, currentStatus: boolean | null) => {
    const nextStatus = !(currentStatus ?? true)
    try {
      const res = await fetch('/api/admin/actions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleTestimonialStatus', id, statusTampil: nextStatus })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        // Update state lokal secara instan untuk responsivitas UI yang mulus
        setTestimonials(prev => prev.map(t => t.id === id ? { ...t, status_tampil: nextStatus } : t))
      } else {
        showAlert({
          title: 'Gagal Mengubah Status',
          message: data.error || 'Terjadi kesalahan.',
          type: 'danger'
        })
      }
    } catch (err) {
      console.error(err)
      showAlert({
        title: 'Gangguan Koneksi',
        message: 'Tidak dapat mengubah status.',
        type: 'danger'
      })
    }
  }

  if (loading) {
    return <Loader label="Memuat Manajer Testimonial..." />
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-10 pb-28 md:pb-10 font-sans">

      {/* Header Halaman */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2 bg-yellow-500/10 rounded-xl border border-yellow-500/20 text-yellow-500">
              <MessageSquare size={20} />
            </div>
            <h1 className="text-2xl font-black tracking-tight uppercase leading-none">
              Testimonial <span className="text-yellow-500">Manager</span>
            </h1>
          </div>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wider pl-1">
            Kelola ulasan, testimoni, dan rating bintang dari member komunitas VIP Anda.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="group flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-yellow-400 to-amber-500 p-3 px-5 text-xs font-bold text-black transition-all hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] cursor-pointer active:scale-[0.98]"
        >
          <Plus size={16} />
          <span>Tambah Ulasan</span>
        </button>
      </div>

      {/* Grid Ulasan Testimonial */}
      {testimonials.length === 0 ? (
        <div className="rounded-3xl border border-neutral-900 bg-neutral-950/40 p-12 text-center flex flex-col items-center justify-center gap-4">
          <div className="h-16 w-16 bg-neutral-900/80 rounded-2xl flex items-center justify-center border border-neutral-800 text-neutral-600">
            <MessageSquare size={28} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-neutral-300">Belum Ada Testimonial</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-sm">
              Klik tombol di atas untuk membuat ulasan pertama Anda. Ulasan ini akan ditampilkan secara otomatis di Landing Page.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => {
            const isTampil = t.status_tampil ?? true
            return (
              <div
                key={t.id}
                className={`relative overflow-hidden rounded-3xl border bg-neutral-900/30 p-6 flex flex-col gap-4 transition-all duration-300 ${isTampil
                    ? 'border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                    : 'border-red-950/40 bg-neutral-950/40 opacity-70'
                  }`}
              >
                {/* Header Ulasan */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {t.foto_user ? (
                      <img
                        src={t.foto_user}
                        alt={t.nama_user}
                        className="h-10 w-10 rounded-full object-cover border border-neutral-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.dicebear.com/7.x/initials/svg?seed=${t.nama_user}`
                        }}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-xs uppercase">
                        {t.nama_user.substring(0, 2)}
                      </div>
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight leading-none">{t.nama_user}</h4>
                      <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mt-1">{t.peran_user || 'Member'}</p>
                    </div>
                  </div>

                  {/* Rating Bintang */}
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={12}
                        className={i < (t.rating || 5) ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-700'}
                      />
                    ))}
                  </div>
                </div>

                {/* Isi Ulasan */}
                <p className="text-xs text-neutral-400 leading-relaxed italic grow">
                  &quot;{t.isi_testi}&quot;
                </p>

                {/* Footer Kontrol */}
                <div className="border-t border-neutral-900 pt-4 mt-auto flex items-center justify-between gap-4">
                  {/* Status Toggle Button */}
                  <button
                    onClick={() => handleToggleStatus(t.id, t.status_tampil)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border cursor-pointer transition-all ${isTampil
                        ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/25'
                        : 'bg-neutral-800 text-neutral-400 border-neutral-700 hover:bg-neutral-700'
                      }`}
                  >
                    {isTampil ? (
                      <>
                        <Eye size={12} />
                        <span>Tampil</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={12} />
                        <span>Disembunyikan</span>
                      </>
                    )}
                  </button>

                  {/* Aksi Edit & Hapus */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(t)}
                      className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-neutral-800 transition cursor-pointer"
                      title="Ubah Ulasan"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(t.id, t.nama_user)}
                      className="p-2 rounded-xl text-red-500/60 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                      title="Hapus Ulasan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* MODAL FORM TESTIMONIAL (Glassmorphism Modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => !actionLoading && setIsModalOpen(false)}
          />

          {/* Kontainer Dialog */}
          <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl p-6 md:p-8 animate-in fade-in zoom-in duration-200">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-neutral-900 pb-4 mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-white">
                {editingId ? 'Ubah Testimonial Member' : 'Tambah Testimonial Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                disabled={actionLoading}
                className="p-1 rounded-lg text-neutral-500 hover:text-white transition cursor-pointer disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">

              {/* Nama Pengulas */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase ml-1">
                  Nama Member / Pengulas
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={15} />
                  <input
                    type="text"
                    required
                    className="w-full rounded-2xl bg-neutral-900 p-3 pl-11 text-xs text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="Sultan Crypto"
                    value={namaUser}
                    onChange={(e) => setNamaUser(e.target.value)}
                  />
                </div>
              </div>

              {/* Peran / Jabatan */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase ml-1">
                  Peran / Posisi
                </label>
                <input
                  type="text"
                  className="w-full rounded-2xl bg-neutral-900 p-3 text-xs text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                  placeholder="Full-time Trader (e.g. VIP Member, Analyst)"
                  value={peranUser}
                  onChange={(e) => setPeranUser(e.target.value)}
                />
              </div>

              {/* Foto User (Avatar URL) */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase ml-1 flex justify-between">
                  <span>URL Foto Profil (Opsional)</span>
                  <span className="text-neutral-600 font-medium">Bisa dikosongkan</span>
                </label>
                <div className="relative group">
                  <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-500 transition-colors" size={15} />
                  <input
                    type="url"
                    className="w-full rounded-2xl bg-neutral-900 p-3 pl-11 text-xs text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all"
                    placeholder="https://i.pravatar.cc/150?u=seed"
                    value={fotoUser}
                    onChange={(e) => setFotoUser(e.target.value)}
                  />
                </div>
              </div>

              {/* Rating Bintang */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase ml-1">
                  Rating Bintang (1 - 5)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  {[1, 2, 3, 4, 5].map((starValue) => {
                    const isActive = starValue <= rating
                    return (
                      <button
                        key={starValue}
                        type="button"
                        onClick={() => setRating(starValue)}
                        className="p-1 rounded text-neutral-500 hover:scale-110 active:scale-95 transition cursor-pointer"
                      >
                        <Star
                          size={24}
                          className={isActive ? 'text-yellow-500 fill-yellow-500' : 'text-neutral-800'}
                        />
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Teks Ulasan */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-neutral-400 tracking-widest uppercase ml-1">
                  Isi Testimonial / Ulasan
                </label>
                <textarea
                  required
                  rows={4}
                  className="w-full rounded-2xl bg-neutral-900 p-3 text-xs text-white border border-neutral-800 focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 focus:outline-none transition-all resize-none"
                  placeholder="Tuliskan ulasan member secara detail di sini..."
                  value={isiTesti}
                  onChange={(e) => setIsiTesti(e.target.value)}
                />
              </div>

              {/* Status Tampil Sakelar */}
              <div className="flex items-center justify-between py-2 px-1">
                <div className="text-left">
                  <label className="text-xs font-bold text-white tracking-tight leading-none uppercase">Tampilkan di Landing Page</label>
                  <p className="text-[10px] text-neutral-500 uppercase tracking-wide font-semibold mt-1">Jika dimatikan, ulasan akan diarsipkan.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStatusTampil(!statusTampil)}
                  className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-all duration-300 ${statusTampil ? 'bg-yellow-500' : 'bg-neutral-800'
                    }`}
                >
                  <div
                    className={`bg-black w-4 h-4 rounded-full shadow-md transition-transform duration-300 ${statusTampil ? 'translate-x-6' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>

              {/* Footer Aksi */}
              <div className="flex gap-3 pt-4 border-t border-neutral-900 mt-6">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 border border-neutral-800 hover:bg-neutral-900 transition font-bold text-xs text-neutral-400 hover:text-white rounded-2xl cursor-pointer disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 py-3 bg-linear-to-r from-yellow-400 to-amber-500 font-bold text-xs text-black rounded-2xl transition hover:scale-[1.02] cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Menyimpan...</span>
                    </>
                  ) : (
                    <span>Simpan Ulasan</span>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  )
}
