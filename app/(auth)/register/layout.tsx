import { Metadata } from 'next';

// Metadata halaman pendaftaran yang dirender server-side
export const metadata: Metadata = {
  title: 'Daftar Member Premium',
  description: 'Daftar sekarang untuk bergabung dengan Imperium Crypto, komunitas premium dan terpercaya untuk belajar investasi crypto.',
  alternates: {
    canonical: '/register',
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
