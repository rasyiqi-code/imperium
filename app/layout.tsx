import type { Metadata } from "next";
import "./globals.css";
import ModalProvider from "@/components/ModalProvider";

// URL dasar situs web, fallback ke domain produksi default jika env tidak disetel
const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://imperiumcrypto.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Imperium - Komunitas Crypto Profesional",
    template: "%s | Imperium",
  },
  description:
    "Bergabunglah dengan komunitas Crypto premium. Diskusi berkualitas, networking autentik, dan insight eksklusif untuk pemula hingga profesional.",
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
        url: "/logo.png",
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
    images: ["/logo.png"],
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
  return (
    <html lang="id" className="scroll-smooth">
      <head />
      <body className="relative min-h-screen overflow-x-hidden bg-black text-white antialiased">
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none z-0" />
        <div className="relative z-10 min-h-screen">
          <ModalProvider>
            {children}
          </ModalProvider>
        </div>
      </body>
    </html>
  );
}