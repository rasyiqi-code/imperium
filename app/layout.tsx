import type { Metadata } from "next";
import "./globals.css";
import ModalProvider from "@/components/ModalProvider";

export const metadata: Metadata = {
  title: "Imperium - Komunitas Crypto Profesional",
  description:
    "Bergabunglah dengan komunitas Crypto premium. Diskusi berkualitas, networking autentik, dan insight eksklusif untuk pemula hingga profesional.",
  keywords:
    "komunitas crypto premium, discord crypto private, crypto networking, diskusi crypto eksklusif, grup crypto terkurasi, komunitas blockchain profesional, forum crypto aman, komunitas trader crypto, komunitas investor crypto, ruang diskusi crypto tertutup, komunitas crypto terpercaya",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <head />
      <body className="relative min-h-screen overflow-x-hidden bg-linear-to-br from-black via-neutral-900 to-black text-white antialiased">
        <ModalProvider>
          {children}
        </ModalProvider>
      </body>
    </html>
  );
}