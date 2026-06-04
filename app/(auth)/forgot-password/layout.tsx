import { Metadata } from 'next';

// Metadata halaman lupa password yang dirender secara server-side
export const metadata: Metadata = {
  title: 'Lupa Password',
  description: 'Atur ulang kata sandi akun Imperium Crypto Anda secara aman dengan mengirimkan email pemulihan.',
  alternates: {
    canonical: '/forgot-password',
  },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
