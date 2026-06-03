'use client'

import Loader from '@/components/Loader'

// Halaman loading default untuk rute dashboard user
export default function Loading() {
  return <Loader fullScreen={false} label="Memuat Halaman..." />
}
