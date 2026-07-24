'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import GoldCoin from '@/components/ui/GoldCoin';
import BrandLogo from '@/components/ui/BrandLogo';
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
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 backdrop-blur-xl bg-zinc-950/80">
        <div className="px-4 md:px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
          <BrandLogo size={32} href="/" />
          <div className="hidden md:flex gap-4 items-center">
            <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors text-sm">How It Works</a>
            <a href="#referral" className="text-gray-400 hover:text-white transition-colors text-sm">Referrals</a>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Sign In</Link>
            <Link href="/register" className="bg-gold-500 text-black px-5 py-2 rounded-lg font-semibold hover:bg-gold-400 transition-colors text-sm">Get Started</Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-400 hover:text-white p-2">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d={mobileMenuOpen ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </nav>
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-3">
              <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>How It Works</a>
              <a href="#referral" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Referrals</a>
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link href="/register" className="bg-gold-500 text-black px-6 py-3 rounded-lg font-semibold text-center hover:bg-gold-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/[0.07] via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gold-500/[0.04] rounded-full blur-[120px]" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 pt-12 md:pt-20 pb-16 md:pb-28 text-center relative">
          <FadeInUp>
            <div className="inline-flex items-center gap-2 mb-6 md:mb-8 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-gold-400 text-xs md:text-sm font-medium">Pre-order phase active — Launching Oct 1, 2026</span>
            </div>
          </FadeInUp>

          <FadeInUp delay={0.1}>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-5 md:mb-6 leading-[1.1] tracking-tight">
              The Future of<br />
              <span className="text-shimmer">Digital Gold</span>
            </h1>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <p className="text-base md:text-lg text-gray-400 mb-8 md:mb-10 max-w-2xl mx-auto leading-relaxed">
              GoldenPrime Gold Coin (GPG) is a tokenized gold asset priced at{' '}
              <span className="text-gold-400 font-semibold">$50 per coin</span>. Preorder now, trade P2P, and earn referral rewards on a fully regulated platform.
            </p>
          </FadeInUp>

          <FadeInUp delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-10 md:mb-16">
              <Link href="/register" className="group relative bg-gold-500 text-black px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gold-400 transition-all text-center overflow-hidden">
                <span className="relative z-10">Start Investing &rarr;</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              <a href="#how-it-works" className="border border-zinc-700 px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-zinc-800/80 hover:border-zinc-600 transition-all text-center">
                How It Works
              </a>
            </div>
          </FadeInUp>

          {/* Gold coin visual */}
          <FadeInUp delay={0.4}>
            <div className="flex justify-center items-center gap-0 md:gap-2 mb-10 md:mb-14">
              <GoldCoin size={100} showGlow={true} floating={true} />
              <GoldCoin size={160} showGlow={true} floating={true} />
              <GoldCoin size={100} showGlow={true} floating={true} />
            </div>
          </FadeInUp>

          {/* Countdown */}
          <FadeInUp delay={0.5}>
            <div className="mb-8 md:mb-12">
              <p className="text-gray-500 mb-4 text-xs md:text-sm uppercase tracking-[0.2em] font-medium">Time Until Launch</p>
              <Countdown targetDate="2026-10-01T00:00:00Z" />
            </div>
          </FadeInUp>

          {/* Stats */}
          {coinInfo && (
            <FadeInUp delay={0.6}>
              <div className="grid grid-cols-3 gap-3 md:gap-6 max-w-lg mx-auto">
                {[
                  { value: coinInfo.totalSupply?.toLocaleString(), label: 'Total Supply' },
                  { value: coinInfo.totalSold?.toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Preordered' },
                  { value: coinInfo.remaining?.toLocaleString(undefined, { maximumFractionDigits: 0 }), label: 'Remaining' },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    whileHover={{ y: -2 }}
                    className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-3 md:p-5 backdrop-blur-sm"
                  >
                    <p className="text-lg md:text-2xl font-bold text-gold-400">{stat.value}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </FadeInUp>
          )}
        </div>
      </section>

      {/* Trusted by section */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12">
          {['Bank-Grade Security', 'Instant P2P Trading', 'Tiered Referral Rewards', 'Fully Regulated'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-gray-500 text-xs md:text-sm">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-500/60 shrink-0">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <FadeInUp>
          <div className="text-center mb-10 md:mb-14">
            <span className="text-gold-500 text-xs md:text-sm font-semibold uppercase tracking-[0.15em]">Simple Process</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">How It Works</h2>
            <p className="text-gray-400 text-sm md:text-base">Start investing in GoldenPrime Gold Coin in 3 simple steps</p>
          </div>
        </FadeInUp>
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6" delay={0.2}>
          {[
            { step: '01', title: 'Create Account', desc: 'Sign up with your email in seconds. Complete KYC verification to unlock full platform features.', icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-500"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            )},
            { step: '02', title: 'Fund Your Wallet', desc: 'Deposit via bank transfer or card. Your payment details are saved securely for easy recovery.', icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-500"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            )},
            { step: '03', title: 'Preorder GPG', desc: 'Buy GoldenPrime Gold Coins at $50 each. Watch your investment grow as we approach launch day.', icon: (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gold-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
            )},
          ].map((item) => (
            <StaggerItem key={item.step}>
              <motion.div
                whileHover={{ y: -6, borderColor: 'rgba(212,175,55,0.4)' }}
                className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-6 md:p-8 transition-all backdrop-blur-sm h-full"
              >
                <div className="w-12 h-12 rounded-xl bg-gold-500/10 flex items-center justify-center mb-4">{item.icon}</div>
                <div className="text-gold-500/40 text-4xl md:text-5xl font-bold mb-2">{item.step}</div>
                <h3 className="text-lg md:text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm md:text-base leading-relaxed">{item.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Features Grid */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/20">
        <div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <FadeInUp>
            <div className="text-center mb-10 md:mb-14">
              <span className="text-gold-500 text-xs md:text-sm font-semibold uppercase tracking-[0.15em]">Why GoldenPrime</span>
              <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">Built for Investors</h2>
              <p className="text-gray-400 text-sm md:text-base">Everything you need to invest, trade, and grow your digital gold portfolio</p>
            </div>
          </FadeInUp>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5" delay={0.1}>
            {[
              { title: 'P2P Trading', desc: 'Trade GPG and major cryptocurrencies directly with other users through our secure escrow system.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
              { title: 'Tiered Referrals', desc: 'Earn escalating GPG rewards. Bronze to Platinum tiers based on your referral count.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
              { title: 'Secure Wallet', desc: 'Fund your wallet via bank transfer or card. Your payment details are saved securely.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
              { title: 'Web3 Ready', desc: 'Connect your MetaMask wallet for seamless blockchain interactions and future DeFi features.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
              { title: 'KYC Verified', desc: 'Complete identity verification for enhanced security and higher transaction limits.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
              { title: 'AI Assistant', desc: 'Get instant answers to your questions with our built-in AI-powered chatbot support.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
            ].map((feature) => (
              <StaggerItem key={feature.title}>
                <motion.div
                  whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.3)' }}
                  className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 md:p-6 transition-all h-full"
                >
                  <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 mb-4">{feature.icon}</div>
                  <h3 className="text-base md:text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Referral section */}
      <section id="referral" className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <FadeInUp>
          <div className="relative bg-gradient-to-br from-gold-500/[0.08] via-zinc-900 to-zinc-900 border border-gold-500/20 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
            {/* Background glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/[0.05] rounded-full blur-[100px]" />

            <span className="text-gold-500 text-xs md:text-sm font-semibold uppercase tracking-[0.15em]">Referral Program</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">Refer & Earn Gold</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Invite friends to GoldenPrime and earn{' '}
              <span className="text-gold-400 font-bold">GPG rewards</span> for every successful referral.
              The more you refer, the higher your tier, the more gold you earn.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8 md:mb-10 max-w-3xl mx-auto">
              {[
                { tier: 'Bronze', reward: '0.0001', req: '1-4 referrals', color: '#CD7F32' },
                { tier: 'Silver', reward: '0.0002', req: '5-14 referrals', color: '#C0C0C0' },
                { tier: 'Gold', reward: '0.0005', req: '15-49 referrals', color: '#FFD700' },
                { tier: 'Platinum', reward: '0.001', req: '50+ referrals', color: '#E5E4E2' },
              ].map((t) => (
                <motion.div key={t.tier} whileHover={{ y: -4, scale: 1.02 }} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">{t.tier === 'Bronze' ? '🥉' : t.tier === 'Silver' ? '🥈' : t.tier === 'Gold' ? '🥇' : '💎'}</div>
                  <div className="text-sm font-semibold" style={{ color: t.color }}>{t.tier}</div>
                  <div className="text-lg md:text-xl font-bold text-gold-400 mt-1">{t.reward} GPG</div>
                  <div className="text-[10px] md:text-xs text-gray-500 mt-1">{t.req}</div>
                </motion.div>
              ))}
            </div>

            <Link href="/register" className="bg-gold-500 text-black px-8 py-4 rounded-xl font-bold text-base md:text-lg hover:bg-gold-400 transition-all inline-block">
              Start Earning &rarr;
            </Link>
          </div>
        </FadeInUp>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <FadeInUp>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to Own Digital Gold?</h2>
            <p className="text-gray-400 mb-8 text-sm md:text-base max-w-xl mx-auto">
              Join thousands of investors who are already preordering GoldenPrime Gold Coin. Secure your GPG at $50 before launch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/register" className="bg-gold-500 text-black px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-gold-400 transition-all text-center">
                Create Free Account
              </Link>
              <Link href="/whitepaper" className="border border-zinc-700 px-8 py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-zinc-800/80 transition-all text-center">
                Read Whitepaper
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <BrandLogo size={28} />
            <div className="flex gap-6 md:gap-8 items-center">
              <Link href="/whitepaper" className="text-gray-500 hover:text-gold-500 text-sm transition-colors">Whitepaper</Link>
              <Link href="/register" className="text-gray-500 hover:text-white text-sm transition-colors">Get Started</Link>
              <Link href="/login" className="text-gray-500 hover:text-white text-sm transition-colors">Sign In</Link>
            </div>
          </div>
          <div className="border-t border-zinc-800/50 mt-6 pt-6 text-center">
            <p className="text-gray-600 text-xs">&copy; 2026 GoldenPrime Investments Ltd. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
