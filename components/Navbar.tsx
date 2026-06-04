"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Link menu untuk mempermudah maintenance
  const navLinks = [
    { name: 'Core Values', href: '/#values' },
    { name: 'Pricing', href: '/#pricing' },
    { name: 'About Us', href: '/#about' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 pt-3">
      <div className="max-w-5xl mx-auto rounded-full border border-white/[0.06] bg-black px-5 py-0.5 shadow-[0_10px_35px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-white/[0.1]">
        <div className="flex justify-between items-center h-12">
          
          {/* KIRI: Logo */}
          <div className="shrink-0 flex items-center">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.webp" 
                alt="Imperium Crypto Logo" 
                width={34} 
                height={34} 
                priority
                className="cursor-pointer object-contain transition-transform duration-300 hover:scale-105 rounded-full"
              />
            </Link>
          </div>

          {/* TENGAH: Menu (Desktop) */}
          <div className="hidden md:flex space-x-8 items-center">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                className="text-white hover:text-yellow-400 transition-colors font-semibold text-xs tracking-wider uppercase"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* KANAN: Tombol Gabung/Login (Desktop) */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              href="/login" 
              className="text-[#d4af37]/80 font-bold hover:text-white transition-colors text-[10px] tracking-wider uppercase"
            >
              Login
            </Link>
            <Link 
              href="/#pricing" 
              className="bg-[#d4af37] hover:bg-[#b8962e] text-black px-4.5 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider transition-all shadow-[0_4px_15px_rgba(212,175,55,0.15)] hover:shadow-[0_4px_25px_rgba(212,175,55,0.3)] active:scale-95"
            >
              Gabung Sekarang
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-[#d4af37] focus:outline-none p-1.5 hover:bg-white/5 rounded-full transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Dropdown) - Dibuat melayang terpisah dengan gaya serasi */}
      {isOpen && (
        <div className="absolute top-20 left-4 right-4 bg-black border border-white/[0.08] rounded-3xl pb-6 px-6 pt-4 shadow-[0_15px_30px_rgba(0,0,0,0.5)] flex flex-col space-y-4 animate-in fade-in slide-in-from-top-4 duration-300 z-50">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name}
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className="text-white py-2 hover:text-[#d4af37] font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <hr className="border-white/[0.06]" />
            <Link 
              href="/login" 
              onClick={() => setIsOpen(false)}
              className="text-[#d4af37] py-2 font-bold text-xs tracking-wider uppercase"
            >
              Login
            </Link>
            <Link 
              href="/#pricing" 
              onClick={() => setIsOpen(false)}
              className="bg-[#d4af37] text-black text-center py-3 rounded-full font-bold text-xs tracking-wider uppercase shadow-[0_4px_15px_rgba(212,175,55,0.15)]"
            >
              Gabung Sekarang
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;