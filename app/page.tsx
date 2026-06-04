import Hero from '@/components/landing/Hero';
import TrustPositioning from '@/components/landing/CoreValues';
import ProblemStatement from '@/components/landing/Problem';
import AboutImperium from '@/components/landing/AboutImperium';
import Footer from '@/components/Footer';
import Navbar from '@/components/landing/Navbar';
import Pricing from '@/components/landing/Pricing';
import FAQ from '@/components/landing/FAQ';
import CTA from '@/components/landing/CTA';
import dynamic from 'next/dynamic';

// Import komponen ulasan secara dinamis guna memisahkan library Swiper yang berat dari bundle awal
const Reviews = dynamic(() => import('@/components/landing/review'));


// URL dasar situs web
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://imperiumcrypto.com";

export const metadata = {
  title: 'Imperium Crypto - Kuasai Analisis, Singkirkan Noise',
  description: 'Kuasai analisis, singkirkan noise, dan pimpin imperium kripto Anda sendiri bersama komunitas VIP premium.',
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    title: 'Imperium Crypto - Kuasai Analisis, Singkirkan Noise',
    description: 'Kuasai analisis, singkirkan noise, dan pimpin imperium kripto Anda sendiri bersama komunitas VIP premium.',
    images: [
      {
        url: "/crypto_login.webp",
        width: 1200,
        height: 675,
        alt: "Imperium Crypto Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: 'Imperium Crypto - Kuasai Analisis, Singkirkan Noise',
    description: 'Kuasai analisis, singkirkan noise, dan pimpin imperium kripto Anda sendiri bersama komunitas VIP premium.',
    images: ["/crypto_login.webp"],
  },
};

export default function Home() {
  // Skema Data Terstruktur JSON-LD untuk mempermudah perayapan mesin pencari (SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "Imperium Crypto",
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "@id": `${siteUrl}/#logo`,
          "url": `${siteUrl}/logo.webp`,
          "caption": "Imperium Crypto Logo"
        },
        "image": {
          "@id": `${siteUrl}/#logo`
        },
        "sameAs": [
          "https://discord.gg/xz5XYq3CFt"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "Imperium Crypto",
        "description": "Komunitas Crypto premium untuk belajar investasi crypto dengan pendekatan data-driven.",
        "publisher": {
          "@id": `${siteUrl}/#organization`
        },
        "inLanguage": "id-ID"
      },
      {
        "@type": "Service",
        "@id": `${siteUrl}/#service`,
        "name": "Imperium VIP Membership",
        "provider": {
          "@id": `${siteUrl}/#organization`
        },
        "description": "Akses eksklusif ke komunitas discord private, sinyal akurat, analisis data-driven, dan networking elit.",
        "offers": {
          "@type": "Offer",
          "priceCurrency": "IDR",
          "price": "149000",
          "availability": "https://schema.org/InStock",
          "url": siteUrl
        }
      }
    ]
  };

  return (
    <main className="min-h-screen">
      {/* Menyuntikkan JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <Hero />
      
      <AboutImperium />
      <ProblemStatement />
      <TrustPositioning />
      <Pricing />
      <Reviews />
      <FAQ />
      <CTA />
      <Footer />
    </main>
  );
}