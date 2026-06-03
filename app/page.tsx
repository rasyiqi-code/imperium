import Hero from '@/components/Hero';
import TrustPositioning from '@/components/CoreValues';
import ProblemStatement from '@/components/Problem';
import AboutImperium from '@/components/AboutImperium';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import Pricing from '@/components/Pricing';
import Reviews from '@/components/review';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';

// URL dasar situs web
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://imperiumcrypto.com";

export const metadata = {
  title: 'Imperium Crypto - Komunitas Premium untuk Belajar Investasi Crypto',
  description: 'Bergabunglah dengan Imperium Crypto, komunitas eksklusif untuk belajar investasi crypto dengan pendekatan data-driven dan mindset finansial yang tepat.',
  alternates: {
    canonical: './',
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    title: 'Imperium Crypto - Komunitas Premium untuk Belajar Investasi Crypto',
    description: 'Bergabunglah dengan Imperium Crypto, komunitas eksklusif untuk belajar investasi crypto dengan pendekatan data-driven dan mindset finansial yang tepat.',
    images: [
      {
        url: "/crypto_login.png",
        width: 1200,
        height: 675,
        alt: "Imperium Crypto Premium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: 'Imperium Crypto - Komunitas Premium untuk Belajar Investasi Crypto',
    description: 'Bergabunglah dengan Imperium Crypto, komunitas eksklusif untuk belajar investasi crypto dengan pendekatan data-driven dan mindset finansial yang tepat.',
    images: ["/crypto_login.png"],
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
          "url": `${siteUrl}/logo.png`,
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