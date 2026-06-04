import type { Metadata } from "next";
import "./globals.css";
import ModalProvider from "@/components/ModalProvider";
import PWARegister from "@/components/PWARegister";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import fs from "fs";
import path from "path";
import { Plus_Jakarta_Sans, Lora, Cormorant_Garamond } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta-sans',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  variable: '--font-cormorant-garamond',
  style: ['normal', 'italic'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

// URL dasar situs web, fallback ke domain produksi default jika env tidak disetel
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://imperiumcrypto.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Imperium Crypto - Kuasai Analisis, Singkirkan Noise, dan Pimpin Imperium Kripto Anda Sendiri.",
    template: "%s - Imperium Crypto",
  },
  description:
    "Kuasai analisis, singkirkan noise, dan pimpin imperium kripto Anda sendiri bersama komunitas VIP premium.",
  keywords:
    "komunitas crypto premium, discord crypto private, crypto networking, diskusi crypto eksklusif, grup crypto terkurasi, komunitas blockchain profesional, forum crypto aman, komunitas trader crypto, komunitas investor crypto, ruang diskusi crypto tertutup, komunitas crypto terpercaya",
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: siteUrl,
    title: "Imperium - Komunitas Crypto Profesional",
    description:
      "Bergabunglah dengan komunitas Crypto premium. Diskusi berkualitas, networking autentik, dan insight eksklusif untuk pemula hingga profesional.",
    siteName: "Imperium Crypto",
    images: [
      {
        url: "/logo.webp",
        width: 1200,
        height: 630,
        alt: "Imperium Crypto Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Imperium - Komunitas Crypto Profesional",
    description:
      "Bergabunglah dengan komunitas Crypto premium. Diskusi berkualitas, networking autentik, dan insight eksklusif untuk pemula hingga profesional.",
    images: ["/logo.webp"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pengecekan Integritas Lisensi - Anti Hapus Kredit Crediblemark
  try {
    const footerFilePath = path.join(process.cwd(), "components", "Footer.tsx");
    if (fs.existsSync(footerFilePath)) {
      const footerContent = fs.readFileSync(footerFilePath, "utf8");
      if (!footerContent.includes("https://crediblemark.com")) {
        throw new Error("System Integrity Violation: Required licensing credits for Crediblemark are missing.");
      }
    }
  } catch (error) {
    console.error("Lisensi tidak valid:", error);
    throw new Error("License Integrity Failure: System has been tampered.");
  }
  return (
    <html lang="id" className={`scroll-smooth ${plusJakartaSans.variable} ${lora.variable} ${cormorantGaramond.variable}`}>
      <head />
      <body className="relative min-h-screen overflow-x-hidden bg-[#020202] text-white antialiased">
        {/* Wrapper latar belakang untuk mencegah kebocoran efek glow (overflow-y) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Pola grid latar belakang */}
          <div className="absolute inset-0 bg-grid-pattern" />
          
          {/* Ambient Aurora Glows - Menyediakan kedalaman visual 3D yang dinamis di latar belakang */}
          <div className="hidden sm:block absolute top-[-100px] left-[-150px] w-[500px] h-[500px] rounded-full bg-aurora-gold blur-[150px] opacity-60 animate-pulse-slow" />
          <div className="hidden sm:block absolute top-[35%] right-[-150px] w-[600px] h-[600px] rounded-full bg-aurora-gold blur-[180px] opacity-45 animate-pulse-slow" />
          <div className="hidden sm:block absolute bottom-[10%] left-[-200px] w-[550px] h-[550px] rounded-full bg-aurora-gold blur-[160px] opacity-40 animate-pulse-slow" />
        </div>
        
        <div className="relative z-10 min-h-screen">
          <PWARegister />
          <PWAInstallPrompt />
          <ModalProvider>
            {children}
          </ModalProvider>
        </div>
        <SpeedInsights />
      </body>
    </html>
  );
}