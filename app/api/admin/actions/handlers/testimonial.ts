import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
  * Mengambil semua daftar testimonial yang ada di database (untuk admin).
  */
export async function getTestimonials() {
  try {
    const data = await prisma.testimonials.findMany({
      orderBy: { created_at: 'desc' }
    })
    return NextResponse.json(data)
  } catch (error: unknown) {
    const err = error as Error
    console.error('getTestimonials Error:', err)
    return NextResponse.json({ error: 'Gagal mengambil data testimonial: ' + err.message }, { status: 500 })
  }
}

/**
  * Menambahkan data testimonial baru.
  */
export async function addTestimonial(body: {
  namaUser: string
  fotoUser?: string
  peranUser?: string
  isiTesti: string
  rating?: number
  statusTampil?: boolean
}) {
  try {
    const { namaUser, fotoUser, peranUser, isiTesti, rating, statusTampil } = body

    if (!namaUser || !isiTesti) {
      return NextResponse.json({ error: 'Nama pengulas dan isi ulasan wajib diisi.' }, { status: 400 })
    }

    const newTesti = await prisma.testimonials.create({
      data: {
        nama_user: namaUser,
        foto_user: fotoUser || null,
        peran_user: peranUser || 'Member',
        isi_testi: isiTesti,
        rating: rating !== undefined ? rating : 5,
        status_tampil: statusTampil !== undefined ? statusTampil : true
      }
    })

    return NextResponse.json({ success: true, data: newTesti })
  } catch (error: unknown) {
    const err = error as Error
    console.error('addTestimonial Error:', err)
    return NextResponse.json({ error: 'Gagal menambahkan testimonial: ' + err.message }, { status: 500 })
  }
}

/**
  * Memperbarui data testimonial yang sudah ada.
  */
export async function updateTestimonial(body: {
  id: string
  namaUser: string
  fotoUser?: string
  peranUser?: string
  isiTesti: string
  rating?: number
  statusTampil?: boolean
}) {
  try {
    const { id, namaUser, fotoUser, peranUser, isiTesti, rating, statusTampil } = body

    if (!id || !namaUser || !isiTesti) {
      return NextResponse.json({ error: 'Parameter ID, nama pengulas, dan isi ulasan wajib diisi.' }, { status: 400 })
    }

    const updatedTesti = await prisma.testimonials.update({
      where: { id },
      data: {
        nama_user: namaUser,
        foto_user: fotoUser !== undefined ? fotoUser : undefined,
        peran_user: peranUser !== undefined ? peranUser : undefined,
        isi_testi: isiTesti,
        rating: rating !== undefined ? rating : undefined,
        status_tampil: statusTampil !== undefined ? statusTampil : undefined
      }
    })

    return NextResponse.json({ success: true, data: updatedTesti })
  } catch (error: unknown) {
    const err = error as Error
    console.error('updateTestimonial Error:', err)
    return NextResponse.json({ error: 'Gagal memperbarui testimonial: ' + err.message }, { status: 500 })
  }
}

/**
  * Menghapus data testimonial berdasarkan ID.
  */
export async function deleteTestimonial(body: { id: string }) {
  try {
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'ID testimonial wajib disertakan.' }, { status: 400 })
    }

    await prisma.testimonials.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: 'Testimonial berhasil dihapus.' })
  } catch (error: unknown) {
    const err = error as Error
    console.error('deleteTestimonial Error:', err)
    return NextResponse.json({ error: 'Gagal menghapus testimonial: ' + err.message }, { status: 500 })
  }
}

/**
  * Mengubah status tayang (tampilkan/sembunyikan) testimonial di landing page.
  */
export async function toggleTestimonialStatus(body: { id: string; statusTampil: boolean }) {
  try {
    const { id, statusTampil } = body

    if (!id) {
      return NextResponse.json({ error: 'ID testimonial wajib disertakan.' }, { status: 400 })
    }

    const updated = await prisma.testimonials.update({
      where: { id },
      data: { status_tampil: statusTampil }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error: unknown) {
    const err = error as Error
    console.error('toggleTestimonialStatus Error:', err)
    return NextResponse.json({ error: 'Gagal mengubah status testimonial: ' + err.message }, { status: 500 })
  }
}
