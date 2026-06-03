import { MetadataRoute } from 'next';

// Membuat aturan robots.txt secara dinamis menggunakan Next.js Metadata API
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://imperiumcrypto.com';
  
  return {
    rules: {
      userAgent: '*',
      // Mengizinkan perayapan halaman publik
      allow: ['/', '/login', '/register'],
      // Melarang perayapan halaman internal/sensitif
      disallow: ['/dashboard/', '/admin-panel/', '/api/'],
    },
    // Mengarahkan mesin pencari ke lokasi sitemap terbaru
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
