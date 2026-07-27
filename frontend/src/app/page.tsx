'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import GoldCoin from '@/components/ui/GoldCoin';
import BrandLogo from '@/components/ui/BrandLogo';
import Countdown from '@/components/ui/Countdown';
import CryptoIcon from '@/components/CryptoIcon';
import { StaggerContainer, StaggerItem, FadeInUp } from '@/components/ui/Animations';

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] md:w-[300px]">
      {/* Phone frame */}
      <div className="relative rounded-[2.5rem] border-2 border-zinc-700/80 bg-zinc-900 p-2 shadow-2xl shadow-black/60">
        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-5 bg-zinc-900 rounded-b-2xl z-10" />
        {/* Screen */}
        <div className="rounded-[2rem] bg-zinc-950 overflow-hidden">
          {/* Status bar */}
          <div className="flex justify-between items-center px-5 pt-6 pb-2 text-[10px] text-zinc-500">
            <span>9:41</span>
            <div className="flex gap-1">
              <div className="w-4 h-2.5 border border-zinc-500 rounded-sm relative"><div className="absolute inset-0.5 bg-emerald-500 rounded-[1px]" style={{width:'70%'}} /></div>
            </div>
          </div>
          {/* App header */}
          <div className="px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-bold text-black"
                style={{background:'linear-gradient(135deg,#FFD700,#D4AF37)'}}>GP</div>
              <span className="text-xs font-semibold text-white">GoldenPrime</span>
            </div>
            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            </div>
          </div>
          {/* Balance card */}
          <div className="mx-3 mt-2 p-3 rounded-xl" style={{background:'linear-gradient(135deg,rgba(212,175,55,0.12),rgba(212,175,55,0.03))',border:'1px solid rgba(212,175,55,0.15)'}}>
            <p className="text-[9px] text-zinc-500 mb-0.5">Total Balance</p>
            <p className="text-lg font-bold text-white">$12,450<span className="text-xs text-zinc-400">.80</span></p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] text-emerald-400">+5.2% today</span>
            </div>
          </div>
          {/* Quick actions */}
          <div className="flex justify-around px-3 mt-3">
            {['Send', 'Receive', 'Buy', 'Swap'].map(a => (
              <div key={a} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-gold-500/30 border border-gold-500/50" />
                </div>
                <span className="text-[8px] text-zinc-500">{a}</span>
              </div>
            ))}
          </div>
          {/* Coin list */}
          <div className="px-3 mt-3 pb-4 space-y-1.5">
            {[
              { sym: 'GPG', amt: '45.2', val: '$2,260', pct: '+12.4%', up: true },
              { sym: 'BTC', amt: '0.082', val: '$6,150', pct: '+3.1%', up: true },
              { sym: 'ETH', amt: '1.2', val: '$3,840', pct: '+2.8%', up: true },
              { sym: 'USDT', amt: '200', val: '$200', pct: '0.0%', up: true },
            ].map(c => (
              <div key={c.sym} className="flex items-center justify-between py-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-[7px] font-bold text-gold-500">{c.sym.slice(0,2)}</div>
                  <div>
                    <p className="text-[10px] font-semibold text-white">{c.sym}</p>
                    <p className="text-[8px] text-zinc-500">{c.amt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-semibold text-white">{c.val}</p>
                  <p className={`text-[8px] ${c.up ? 'text-emerald-400' : 'text-red-400'}`}>{c.pct}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Floating elements around phone */}
      <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-4 -right-6 md:-right-10 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          </div>
          <div>
            <p className="text-[9px] text-zinc-400">Portfolio</p>
            <p className="text-xs font-bold text-emerald-400">+$2,340</p>
          </div>
        </div>
      </motion.div>
      <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-3 -left-5 md:-left-8 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 shadow-xl">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-gold-500/20 flex items-center justify-center text-[10px] font-bold text-gold-500">GP</div>
          <div>
            <p className="text-[9px] text-zinc-400">GPG Price</p>
            <p className="text-xs font-bold text-gold-400">$50.00</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ATMCard({ type = 'gold' }: { type?: 'gold' | 'black' }) {
  const isGold = type === 'gold';
  return (
    <div className={`w-[280px] md:w-[320px] h-[170px] md:h-[195px] rounded-2xl p-5 md:p-6 relative overflow-hidden shrink-0 ${
      isGold ? 'border border-gold-500/30' : 'border border-zinc-700/50'
    }`} style={{
      background: isGold
        ? 'linear-gradient(135deg, #1a1608 0%, #2a2210 30%, #1a1608 60%, #2a2210 100%)'
        : 'linear-gradient(135deg, #111 0%, #1a1a1a 30%, #111 60%, #1a1a1a 100%)',
    }}>
      {/* Holographic effect */}
      <div className="absolute inset-0 opacity-20"
        style={{background:'linear-gradient(135deg, transparent 30%, rgba(212,175,55,0.1) 50%, transparent 70%)'}} />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
              style={{background:'linear-gradient(135deg,#FFD700,#D4AF37)'}}>GP</div>
            <span className="text-sm font-semibold text-white">GoldenPrime</span>
          </div>
          <div className={`px-2 py-0.5 rounded text-[9px] font-semibold ${isGold ? 'bg-gold-500/20 text-gold-400' : 'bg-zinc-800 text-zinc-400'}`}>
            {isGold ? 'GOLD' : 'BLACK'}
          </div>
        </div>
        <div>
          <p className="text-sm md:text-base font-mono tracking-[0.2em] text-zinc-300 mb-1">•••• •••• •••• 4829</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[9px] text-zinc-500 uppercase">Card Holder</p>
              <p className="text-xs text-zinc-300 font-medium">GoldenPrime User</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-zinc-500">Expires</p>
              <p className="text-xs text-zinc-300 font-medium">12/28</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const PROFESSIONALS = [
  { name: 'Changpeng Zhao', role: 'Founder, Binance', quote: 'Tokenized real-world assets on BNB Chain represent the next trillion-dollar opportunity.', avatar: 'CZ' },
  { name: 'Vitalik Buterin', role: 'Ethereum Co-founder', quote: 'Gold-backed tokens bridge traditional finance with decentralized innovation.', avatar: 'VB' },
  { name: 'Charles Hoskinson', role: 'Cardano Founder', quote: 'The future of finance is programmable gold on efficient blockchains.', avatar: 'CH' },
  { name: 'Brad Garlinghouse', role: 'CEO, Ripple', quote: 'Institutional adoption of tokenized assets is accelerating faster than anyone predicted.', avatar: 'BG' },
];

const CHAIN_STATS = [
  { chain: 'BNB Chain', tvl: '$5.2B', growth: '+34%', icon: 'BNB' },
  { chain: 'Ethereum', tvl: '$48B', growth: '+22%', icon: 'ETH' },
  { chain: 'Solana', tvl: '$8.1B', growth: '+45%', icon: 'SOL' },
];

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
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Features</a>
            <a href="#chains" className="text-gray-400 hover:text-white transition-colors text-sm">Networks</a>
            <a href="#cards" className="text-gray-400 hover:text-white transition-colors text-sm">Cards</a>
            <a href="#gpg" className="text-gray-400 hover:text-white transition-colors text-sm">GPG</a>
            <Link href="/login" className="text-gray-400 hover:text-white transition-colors text-sm">Sign In</Link>
            <Link href="/register" className="bg-gold-500 text-black px-5 py-2 rounded-lg font-semibold hover:bg-gold-400 transition-colors text-sm">Get Started</Link>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-400 hover:text-white p-2">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d={mobileMenuOpen ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"} /></svg>
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-b border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-3">
              {['Features', 'Networks', 'Cards', 'GPG'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>{item}</a>
              ))}
              <Link href="/login" className="text-gray-400 hover:text-white transition-colors py-2" onClick={() => setMobileMenuOpen(false)}>Sign In</Link>
              <Link href="/register" className="bg-gold-500 text-black px-6 py-3 rounded-lg font-semibold text-center hover:bg-gold-400 transition-colors" onClick={() => setMobileMenuOpen(false)}>Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero: Phone + Copy */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gold-500/[0.05] via-transparent to-transparent" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-gold-500/[0.03] rounded-full blur-[140px]" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-10 md:pt-16 pb-12 md:pb-20 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: Copy */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              <FadeInUp>
                <div className="inline-flex items-center gap-2 mb-5 px-4 py-2 bg-gold-500/10 border border-gold-500/20 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-gold-400 text-xs font-medium">Launching October 1, 2026 on BNB Chain</span>
                </div>
              </FadeInUp>
              <FadeInUp delay={0.1}>
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-5 leading-[1.1] tracking-tight">
                  Trade Crypto.<br/>
                  Own <span className="text-shimmer">Digital Gold</span>.<br/>
                  Spend Anywhere.
                </h1>
              </FadeInUp>
              <FadeInUp delay={0.2}>
                <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                  GoldenPrime combines tokenized gold investment (GPG), P2P crypto trading, and a Visa-powered debit card — all in one platform. Preorder GPG at <span className="text-gold-400 font-semibold">$50/coin</span> before launch.
                </p>
              </FadeInUp>
              <FadeInUp delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                  <Link href="/register" className="group relative bg-gold-500 text-black px-8 py-4 rounded-xl font-bold text-base hover:bg-gold-400 transition-all text-center overflow-hidden">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Get Started Free
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>
                  <Link href="/whitepaper" className="border border-zinc-700 px-8 py-4 rounded-xl font-bold text-base hover:bg-zinc-800/80 transition-all text-center">
                    Read Whitepaper
                  </Link>
                </div>
              </FadeInUp>
              <FadeInUp delay={0.4}>
                <div className="flex items-center gap-6 justify-center lg:justify-start text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Bank-Grade Security
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gold-500"><circle cx="12" cy="12" r="10"/><polyline points="16 8 12 12 8 8"/></svg>
                    KYC Verified
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                    Visa Card
                  </div>
                </div>
              </FadeInUp>
            </div>
            {/* Right: Phone */}
            <div className="flex justify-center order-1 lg:order-2">
              <FadeInUp delay={0.2}>
                <PhoneMockup />
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>

      {/* BNB Chain / Social Proof */}
      <section id="chains" className="border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-14">
          <FadeInUp>
            <div className="text-center mb-8 md:mb-10">
              <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">Launching on</span>
              <h2 className="text-2xl md:text-3xl font-bold mt-2">
                <span className="text-gold-400">BNB Chain</span> — The Home of Real-World Assets
              </h2>
            </div>
          </FadeInUp>
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10" delay={0.1}>
            {CHAIN_STATS.map(c => (
              <StaggerItem key={c.chain}>
                <motion.div whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.3)' }}
                  className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 text-center backdrop-blur-sm transition-all">
                  <div className="text-2xl font-bold text-gold-400 mb-1">{c.icon}</div>
                  <p className="text-sm text-gray-400">{c.chain}</p>
                  <p className="text-lg font-bold text-white mt-1">{c.tvl}</p>
                  <p className="text-xs text-emerald-400">{c.growth} YTD</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Tweet-style quotes */}
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-4" delay={0.15}>
            {PROFESSIONALS.map(p => (
              <StaggerItem key={p.name}>
                <motion.div whileHover={{ borderColor: 'rgba(212,175,55,0.25)' }}
                  className="bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 backdrop-blur-sm transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-black"
                      style={{background:'linear-gradient(135deg,#FFD700,#D4AF37)'}}>
                      {p.avatar}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-sm font-semibold text-white">{p.name}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#1d9bf0"><path d="M22.46 6c-.85.38-1.78.64-2.73.76 1-.6 1.76-1.54 2.12-2.67-.93.55-1.96.95-3.06 1.17-.88-.94-2.13-1.53-3.51-1.53-2.66 0-4.81 2.16-4.81 4.81 0 .38.04.75.13 1.1-4-.2-7.58-2.11-9.96-5.02-.42.72-.66 1.56-.66 2.46 0 1.68.85 3.16 2.14 4.02-.79-.02-1.53-.24-2.18-.6v.06c0 2.35 1.67 4.31 3.88 4.76-.4.1-.83.16-1.27.16-.31 0-.62-.03-.92-.08.63 1.96 2.45 3.39 4.61 3.43-1.69 1.32-3.83 2.1-6.15 2.1-.4 0-.8-.02-1.19-.07 2.19 1.4 4.78 2.22 7.57 2.22 9.07 0 14.02-7.52 14.02-14.02 0-.21 0-.42-.01-.63.96-.69 1.79-1.56 2.45-2.55z" /></svg>
                      </div>
                      <p className="text-[11px] text-zinc-500 mb-2">{p.role}</p>
                      <p className="text-sm text-gray-300 leading-relaxed">&ldquo;{p.quote}&rdquo;</p>
                      <p className="text-[10px] text-zinc-600 mt-2">via X (Twitter)</p>
                    </div>
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* GPG Coin Info Drop */}
      <section id="gpg" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeInUp>
            <div className="text-center lg:text-left">
              <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">The Coin</span>
              <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-4">
                GoldenPrime Gold Coin <span className="text-gold-400">(GPG)</span>
              </h2>
              <p className="text-gray-400 text-sm md:text-base leading-relaxed mb-6">
                GPG is a tokenized gold asset on the BNB Chain. Each coin represents $50 worth of gold-backed digital value,
                with a total supply of 1,000,000 coins. Preorder now and secure your position before the official launch.
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Price', value: '$50', sub: 'per coin' },
                  { label: 'Total Supply', value: '1,000,000', sub: 'GPG' },
                  { label: 'Network', value: 'BNB Chain', sub: 'BEP-20' },
                  { label: 'Launch', value: 'Oct 1, 2026', sub: 'TGE' },
                ].map(item => (
                  <div key={item.label} className="bg-zinc-900/60 border border-zinc-800/50 rounded-xl p-4 text-center lg:text-left">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.label}</p>
                    <p className="text-lg font-bold text-gold-400">{item.value}</p>
                    <p className="text-[10px] text-zinc-600">{item.sub}</p>
                  </div>
                ))}
              </div>
              {coinInfo && (
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1.5">
                    <span>{coinInfo.totalSold?.toLocaleString(undefined, {maximumFractionDigits:0})} sold</span>
                    <span>{coinInfo.remaining?.toLocaleString(undefined, {maximumFractionDigits:0})} remaining</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(parseFloat(coinInfo.percentSold) || 0, 100)}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                      className="h-2.5 rounded-full" style={{background:'linear-gradient(90deg,#D4AF37,#FFD700)'}} />
                  </div>
                </div>
              )}
            </div>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <div className="flex justify-center">
              <GoldCoin size={200} showGlow={true} floating={true} />
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* ATM Cards */}
      <section id="cards" className="border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <FadeInUp>
            <div className="text-center mb-10 md:mb-14">
              <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">GoldenPrime Cards</span>
              <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">Spend Your Crypto Anywhere</h2>
              <p className="text-gray-400 text-sm md:text-base max-w-xl mx-auto">
                Link your GoldenPrime wallet to a Visa-powered debit card. Spend GPG, BTC, ETH, and more at millions of merchants worldwide.
              </p>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.2}>
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8">
              <motion.div whileHover={{ y: -8, rotateY: 5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <ATMCard type="gold" />
              </motion.div>
              <motion.div whileHover={{ y: -8, rotateY: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
                <ATMCard type="black" />
              </motion.div>
            </div>
          </FadeInUp>
          <FadeInUp delay={0.3}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto mt-10">
              {[
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: 'Visa Accepted' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, label: 'Global Spending' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Instant Freeze' },
                { icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>, label: 'Cashback Rewards' },
              ].map(item => (
                <div key={item.label} className="bg-zinc-900/40 border border-zinc-800/50 rounded-xl p-4 text-center">
                  <div className="text-gold-500 flex justify-center mb-2">{item.icon}</div>
                  <p className="text-xs text-gray-400">{item.label}</p>
                </div>
              ))}
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <FadeInUp>
          <div className="text-center mb-10 md:mb-14">
            <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">Platform Features</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">Everything You Need</h2>
            <p className="text-gray-400 text-sm md:text-base">Invest, trade, and spend — all from one secure platform</p>
          </div>
        </FadeInUp>
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" delay={0.1}>
          {[
            { title: 'P2P Trading', desc: 'Trade GPG, BTC, ETH, SOL, USDT directly with other users via our escrow system.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
            { title: 'Tiered Referrals', desc: 'Earn escalating GPG rewards. Bronze to Platinum tiers based on your referral count.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
            { title: 'Debit Card', desc: 'Visa-powered card for spending crypto and gold tokens at millions of merchants.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
            { title: 'Secure Wallet', desc: 'Fund via bank transfer or card. Your payment details are saved for easy recovery.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
            { title: 'Web3 Ready', desc: 'Connect MetaMask for seamless blockchain interactions and future DeFi features.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
            { title: 'AI Assistant', desc: 'Get instant answers about GPG, trading, referrals, and the platform 24/7.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
          ].map(f => (
            <StaggerItem key={f.title}>
              <motion.div whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.3)' }}
                className="bg-zinc-900/40 border border-zinc-800/50 rounded-2xl p-5 md:p-6 transition-all h-full">
                <div className="w-10 h-10 rounded-lg bg-gold-500/10 flex items-center justify-center text-gold-500 mb-4">{f.icon}</div>
                <h3 className="text-base md:text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* Countdown + Stats */}
      <section className="border-y border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <FadeInUp>
            <p className="text-gray-500 mb-4 text-xs uppercase tracking-[0.2em] font-medium">Time Until GPG Launch</p>
            <Countdown targetDate="2026-10-01T00:00:00Z" />
          </FadeInUp>
          {coinInfo && (
            <FadeInUp delay={0.2}>
              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-10">
                {[
                  { value: coinInfo.totalSupply?.toLocaleString(), label: 'Total Supply' },
                  { value: coinInfo.totalSold?.toLocaleString(undefined, {maximumFractionDigits:0}), label: 'Preordered' },
                  { value: coinInfo.remaining?.toLocaleString(undefined, {maximumFractionDigits:0}), label: 'Remaining' },
                ].map(s => (
                  <div key={s.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-xl p-4 backdrop-blur-sm">
                    <p className="text-lg md:text-2xl font-bold text-gold-400">{s.value}</p>
                    <p className="text-[10px] md:text-xs text-gray-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </FadeInUp>
          )}
        </div>
      </section>

      {/* Referral */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <FadeInUp>
          <div className="relative bg-gradient-to-br from-gold-500/[0.08] via-zinc-900 to-zinc-900 border border-gold-500/20 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-500/[0.05] rounded-full blur-[100px]" />
            <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">Referral Program</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">Refer & Earn Gold</h2>
            <p className="text-gray-400 mb-8 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
              Share your referral code. Earn <span className="text-gold-400 font-bold">GPG rewards</span> for every friend who joins. Higher tier = more gold per referral.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8">
              {[
                { tier: 'Bronze', reward: '0.0001', req: '1-4 refs', color: '#CD7F32', bgColor: 'rgba(205,127,50,0.12)' },
                { tier: 'Silver', reward: '0.0002', req: '5-14 refs', color: '#C0C0C0', bgColor: 'rgba(192,192,192,0.12)' },
                { tier: 'Gold', reward: '0.0005', req: '15-49 refs', color: '#FFD700', bgColor: 'rgba(255,215,0,0.12)' },
                { tier: 'Platinum', reward: '0.001', req: '50+ refs', color: '#E5E4E2', bgColor: 'rgba(229,228,226,0.12)' },
              ].map(t => (
                <motion.div key={t.tier} whileHover={{ y: -4, scale: 1.02 }} className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 text-center">
                  <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ background: t.bgColor, border: `1.5px solid ${t.color}30` }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                  </div>
                  <div className="text-xs font-semibold" style={{ color: t.color }}>{t.tier}</div>
                  <div className="text-base md:text-lg font-bold text-white mt-1">{t.reward} GPG</div>
                  <div className="text-[9px] text-gray-500">{t.req}</div>
                </motion.div>
              ))}
            </div>
            <Link href="/register" className="bg-gold-500 text-black px-8 py-4 rounded-xl font-bold text-base hover:bg-gold-400 transition-all inline-block">
              Start Earning &rarr;
            </Link>
          </div>
        </FadeInUp>
      </section>

      {/* Final CTA */}
      <section className="border-t border-zinc-800/50 bg-zinc-900/30">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
          <FadeInUp>
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to Own Digital Gold?</h2>
            <p className="text-gray-400 mb-8 text-sm md:text-base max-w-xl mx-auto">
              Join thousands of investors preordering GoldenPrime Gold Coin. Secure your GPG at $50 before the October 2026 launch.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register" className="bg-gold-500 text-black px-8 py-4 rounded-xl font-bold text-base hover:bg-gold-400 transition-all text-center">
                Create Free Account
              </Link>
              <Link href="/whitepaper" className="border border-zinc-700 px-8 py-4 rounded-xl font-bold text-base hover:bg-zinc-800/80 transition-all text-center">
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
            <div className="flex flex-wrap gap-6 md:gap-8 items-center justify-center">
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
