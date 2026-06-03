'use client'

import Loader from '@/components/Loader'

// Halaman loading default untuk rute admin panel
export default function Loading() {
  return <Loader fullScreen={false} label="Memuat Panel..." />
}
