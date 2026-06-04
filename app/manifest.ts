import { MetadataRoute } from 'next';

// Membuat konfigurasi PWA Web App Manifest secara dinamis untuk SEO mobile
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Imperium Crypto',
    short_name: 'Imperium',
    description: 'Komunitas Crypto premium untuk belajar investasi crypto dengan pendekatan data-driven.',
    start_url: '/',
    display: 'standalone',
    background_color: '#000000',
    theme_color: '#eab308', // Menggunakan warna tema kuning/amber
    icons: [
      {
        src: '/logo.webp',
        sizes: 'any',
        type: 'image/webp',
      },
    ],
  };
}
