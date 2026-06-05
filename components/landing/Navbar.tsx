"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LayoutDashboard, Crown } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Navbar: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    }
    checkAuth();

    // Dengar perubahan status otentikasi secara real-time untuk memperbarui navigasi
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Link menu navigasi
  const navLinks = [
    { name: 'Core Values', href: '/#values' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'About Us', href: '/#about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-3">
      {/* Container utama navbar dengan border & blur gelap premium */}
      <div className="max-w-5xl mx-auto rounded-full border border-white/[0.06] bg-black/80 backdrop-blur-md px-4 sm:px-5 py-0.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/[0.1]">
        <div className="flex justify-between items-center h-12 gap-2">
          
          {/* KIRI: Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.webp" 
                alt="Imperium Crypto Logo" 
                width={30} 
                height={30} 
                priority
                className="cursor-pointer object-contain transition-transform duration-300 hover:scale-105 rounded-full"
                style={{ height: 'auto' }}
              />
            </Link>
          </div>

          {/* TENGAH: Menu Navigasi Horizontal (Tampil di Desktop & Mobile) */}
          <div className="flex items-center space-x-3 sm:space-x-4 md:space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="text-neutral-400 hover:text-white transition-colors font-bold text-[9px] sm:text-[10px] md:text-xs tracking-wider uppercase"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* KANAN: Tombol Aksi Dinamis */}
          <div className="shrink-0 flex items-center">
            {/* Desktop Button (Tampil dari ukuran md ke atas) */}
            <div className="hidden md:block">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard" 
                  className="bg-[#d4af37] hover:bg-[#b8962e] text-black px-4.5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(212,175,55,0.15)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.3)] active:scale-95 cursor-pointer block"
                >
                  Akses Dashboard
                </Link>
              ) : (
                <Link 
                  href="/register" 
                  className="bg-[#d4af37] hover:bg-[#b8962e] text-black px-4.5 py-1.5 rounded-full font-black text-[10px] uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(212,175,55,0.15)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.3)] active:scale-95 cursor-pointer block"
                >
                  Gabung Sekarang
                </Link>
              )}
            </div>

            {/* Mobile Button (Icon Only - Tampil di bawah ukuran md) */}
            <div className="md:hidden">
              {isLoggedIn ? (
                <Link 
                  href="/dashboard" 
                  title="Akses Dashboard"
                  className="flex items-center justify-center bg-[#d4af37] hover:bg-[#b8962e] text-black h-8 w-8 rounded-full transition-all shadow-[0_4px_12px_rgba(212,175,55,0.2)] active:scale-90 cursor-pointer"
                >
                  <LayoutDashboard size={14} className="stroke-[2.5]" />
                </Link>
              ) : (
                <Link 
                  href="/register" 
                  title="Gabung Sekarang"
                  className="flex items-center justify-center bg-[#d4af37] hover:bg-[#b8962e] text-black h-8 w-8 rounded-full transition-all shadow-[0_4px_12px_rgba(212,175,55,0.2)] active:scale-90 cursor-pointer"
                >
                  <Crown size={14} className="stroke-[2.5]" />
                </Link>
              )}
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;