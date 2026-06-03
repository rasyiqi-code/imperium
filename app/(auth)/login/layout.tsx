import { Metadata } from 'next';

// Metadata halaman login yang dirender server-side
export const metadata: Metadata = {
  title: 'Masuk Ke Akun Anda',
  description: 'Masuk ke portal eksklusif Imperium Crypto untuk mengakses sinyal premium, analisis pasar harian, dan forum diskusi privat.',
  alternates: {
    canonical: '/login',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
