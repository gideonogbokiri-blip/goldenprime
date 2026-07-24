'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import GoldCoin from '@/components/ui/GoldCoin';
import Countdown from '@/components/ui/Countdown';
import { StaggerContainer, StaggerItem, FadeInUp } from '@/components/ui/Animations';

export default function Home() {
  const [coinInfo, setCoinInfo] = useState<any>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/gold/coin`)
      .then(r => r.json())
      .then(setCoinInfo)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="border-b border-zinc-800/50 px-4 md:px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-xl md:text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</div>
        {/* Desktop nav */}
        <div className="hidden md:flex gap-4 items-center">
          <Link href="/login" className="text-gray-400 hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="bg-gold-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gold-400 transition-colors">Get Started</Link>
        </div>
        {/* Mobile hamburger */}
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-400 hover:text-white p-2">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d={mobileMenuOpen ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </nav>
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-3">
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link href="/register" className="bg-gold-500 text-black px-6 py-3 rounded-lg font-semibold text-center hover:bg-gold-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/5 via-transparent to-transparent" />
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center relative">
          <FadeInUp>
            <div className="inline-block mb-6 px-4 py-2 bg-gold-500/10 border border-gold-500/30 rounded-full">
              <span className="text-gold-500 text-xs md:text-sm font-semibold">Launching October 1, 2026</span>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 leading-tight">
              Own a Piece of<br />
              <span className="text-shimmer">Digital Gold</span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="text-base md:text-xl text-gray-400 mb-6 md:mb-8 max-w-2xl mx-auto px-2">
              GoldenPrime Gold Coin (GPG) is the future of digital asset investment.
              Preorder now at <span className="text-gold-500 font-bold">$50/GPG</span> before the official launch.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 md:mb-12 px-2">
              <Link href="/register" className="bg-gold-500 text-black px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gold-400 transition-colors text-center">
                Preorder Now
              </Link>
              <a href="#how-it-works" className="border border-zinc-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-zinc-800 transition-colors text-center">
                Learn More
              </a>
            </div>
          </FadeInUp>

          {/* Gold coin visual */}
          <FadeInUp delay={0.4}>
            <div className="flex justify-center mb-8 md:mb-12">
              <GoldCoin size={128} showGlow={true} floating={true} />
              <div className="hidden md:block"><GoldCoin size={192} showGlow={true} floating={true} /></div>
            </div>
          </FadeInUp>

          {/* Countdown */}
          <FadeInUp delay={0.5}>
            <div className="mb-6 md:mb-8">
              <p className="text-gray-400 mb-4 text-xs md:text-sm uppercase tracking-wider">Time Until Launch</p>
              <Countdown targetDate="2026-10-01T00:00:00Z" />
            </div>
          </FadeInUp>

          {/* Stats */}
          {coinInfo && (
            <FadeInUp delay={0.6}>
              <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-lg mx-auto mt-8 md:mt-12 px-2">
                {[
                  { value: coinInfo.totalSupply?.toLocaleString(), label: 'Total Supply' },
                  { value: coinInfo.totalSold?.toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Preordered' },
                  { value: coinInfo.remaining?.toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Remaining' },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2 }}
                    className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3 md:p-4"
                  >
                    <p className="text-lg md:text-2xl font-bold text-gold-500">{stat.value}</p>
                    <p className="text-[10px] md:text-xs text-gray-400">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </FadeInUp>
          )}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20">
        <FadeInUp>
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3 md:mb-4">How It Works</h2>
          <p className="text-gray-400 text-center mb-8 md:mb-12 text-sm md:text-base">Start investing in GoldenPrime Gold Coin in 3 simple steps</p>
        </FadeInUp>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8" delay={0.2}>
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up in seconds with your email. Complete KYC to unlock full features.' },
            { step: '02', title: 'Fund Your Wallet', desc: 'Deposit via bank transfer or card. Your payment details are saved securely for easy recovery.' },
            { step: '03', title: 'Preorder GPG', desc: 'Buy GoldenPrime Gold Coins at $50 each. Watch your investment grow as we approach launch day.' },
          ].map((item) => (
            <StaggerItem key={item.step}>
              <motion.div
                whileHover={{ y: -6, borderColor: 'rgba(212,175,55,0.5)' }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 md:p-6 transition-colors"
              >
                <div className="text-gold-500 text-3xl md:text-4xl font-bold mb-3 md:mb-4">{item.step}</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm md:text-base">{item.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Referral section */}
      <section className="max-w-5xl mx-auto px-4 md:px-6 py-12 md:py-20 border-t border-zinc-800/50">
        <FadeInUp>
          <div className="bg-gradient-to-r from-gold-500/10 via-zinc-900 to-gold-500/10 border border-gold-500/20 rounded-2xl p-6 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 md:mb-4">Refer & Earn Gold</h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto text-sm md:text-base">
              Invite friends to GoldenPrime and earn <span className="text-gold-500 font-bold">0.0001 GPG</span> for every successful referral.
              The more you refer, the more gold you accumulate.
            </p>
            <StaggerContainer className="grid grid-cols-3 items-center justify-center gap-2 md:gap-8 mb-6 md:mb-8" stagger={0.15}>
              {[
                { value: '0.0001', label: 'GPG per referral' },
                { value: 'Unlimited', label: 'Referrals allowed' },
                { value: '$50', label: 'Value per GPG' },
              ].map((stat, i) => (
                <StaggerItem key={stat.label}>
                  <div className="text-center">
                    <div className="text-xl md:text-3xl font-bold text-gold-500">{stat.value}</div>
                    <div className="text-[10px] md:text-sm text-gray-400">{stat.label}</div>
                  </div>
                  {i < 2 && <div className="w-px h-8 md:h-12 bg-zinc-700 hidden md:block" />}
                </StaggerItem>
              ))}
            </StaggerContainer>
            <Link href="/register" className="bg-gold-500 text-black px-6 md:px-8 py-3 md:py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gold-400 transition-colors inline-block">
              Start Earning
            </Link>
          </div>
        </FadeInUp>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 px-4 md:px-6 py-6 md:py-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-xl md:text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</div>
          <div className="flex gap-4 md:gap-6 items-center">
            <Link href="/whitepaper" className="text-gray-400 hover:text-gold-500 text-xs md:text-sm transition-colors">Whitepaper</Link>
            <Link href="/register" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">Get Started</Link>
            <Link href="/login" className="text-gray-400 hover:text-white text-xs md:text-sm transition-colors">Sign In</Link>
          </div>
          <p className="text-gray-500 text-xs md:text-sm">&copy; 2026 GoldenPrime Investments Ltd. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
