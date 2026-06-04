import { Metadata } from 'next';

// Metadata halaman reset password yang dirender secara server-side
export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Atur ulang kata sandi akun Imperium Crypto Anda secara aman dengan memasukkan kata sandi baru.',
  alternates: {
    canonical: '/reset-password',
  },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
