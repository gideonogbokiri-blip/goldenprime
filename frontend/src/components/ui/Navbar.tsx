'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import BrandLogo from './BrandLogo';

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Coming Soon', href: '#coming-soon' },
  { label: 'Cards', href: '#cards' },
  { label: 'Roadmap', href: '#roadmap' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <BrandLogo size={30} href="/" />

          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map(l => (
              <a key={l.href} href={l.href}
                className="px-3 py-2 text-[13px] font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login"
              className="px-4 py-2 text-[13px] font-medium text-zinc-300 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all">
              Sign In
            </Link>
            <Link href="/register"
              className="px-5 py-2.5 text-[13px] font-semibold bg-gold-500 text-black rounded-lg hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10">
              Get Started
            </Link>
          </div>

          <button onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
              {mobileOpen
                ? <path d="M6 6l12 12M6 18L18 6" />
                : <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>}
            </svg>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 md:hidden border-b border-white/[0.06] bg-zinc-950/95 backdrop-blur-2xl">
            <div className="px-4 py-4 flex flex-col gap-1">
              {NAV_LINKS.map(l => (
                <a key={l.href} href={l.href} onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all">
                  {l.label}
                </a>
              ))}
              <div className="border-t border-white/[0.06] mt-2 pt-3 flex flex-col gap-1">
                <Link href="/login" onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.04] transition-all">
                  Sign In
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 text-sm font-semibold bg-gold-500 text-black rounded-lg text-center hover:bg-gold-400 transition-all">
                  Get Started
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
