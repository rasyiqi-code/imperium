import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
        port: '',
        pathname: '/**',
      },
      // Mengizinkan pemuatan QR Code dari API Midtrans
      {
        protocol: 'https',
        hostname: 'api.sandbox.midtrans.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.midtrans.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;