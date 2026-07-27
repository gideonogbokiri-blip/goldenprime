'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import GoldCoin from '@/components/ui/GoldCoin';
import Countdown from '@/components/ui/Countdown';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { StaggerContainer, StaggerItem, FadeInUp } from '@/components/ui/Animations';

function LiveTicker() {
  const [tick, setTick] = useState(0);
  const items = [
    { label: 'BNB', value: '$612.40', change: '+2.1%', up: true },
    { label: 'BTC', value: '$68,420', change: '+1.8%', up: true },
    { label: 'ETH', value: '$3,840', change: '+2.4%', up: true },
    { label: 'GPG', value: '$50.00', change: 'Launch Oct 2026', up: true },
    { label: 'SOL', value: '$142.80', change: '+5.2%', up: true },
    { label: 'USDT', value: '$1.00', change: '0.0%', up: true },
  ];

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 20000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="border-b border-white/[0.04] bg-zinc-950/50 backdrop-blur-sm overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex overflow-hidden">
          {[...items, ...items].map((item, i) => (
            <div key={`${item.label}-${i}-${tick}`}
              className="flex items-center gap-2 px-5 py-2 border-r border-white/[0.04] shrink-0">
              <span className="text-[11px] font-semibold text-zinc-400">{item.label}</span>
              <span className="text-[11px] font-medium text-white">{item.value}</span>
              <span className={`text-[10px] font-medium ${item.up ? 'text-emerald-400' : 'text-red-400'}`}>
                {item.change}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[240px] sm:w-[260px] md:w-[290px]">
      <div className="relative rounded-[2.5rem] border-[1.5px] border-zinc-700/60 bg-zinc-900 p-[7px] shadow-2xl shadow-black/60">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[18px] bg-zinc-900 rounded-b-xl z-10" />
        <div className="rounded-[2rem] bg-zinc-950 overflow-hidden">
          <div className="flex justify-between items-center px-4 pt-5 pb-1 text-[9px] text-zinc-500">
            <span>9:41</span>
            <div className="w-4 h-2.5 border border-zinc-500 rounded-sm relative">
              <div className="absolute inset-0.5 bg-emerald-500 rounded-[1px]" style={{width:'70%'}} />
            </div>
          </div>

          <div className="px-3 py-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full flex items-center text-[6px] font-bold text-black"
                style={{background:'linear-gradient(135deg,#FFD700,#D4AF37)'}}>GP</div>
              <span className="text-[10px] font-semibold text-white">GoldenPrime</span>
            </div>
            <div className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </div>
          </div>

          <div className="mx-3 mt-1.5 p-3 rounded-xl"
            style={{background:'linear-gradient(135deg,rgba(212,175,55,0.1),rgba(212,175,55,0.02))',border:'1px solid rgba(212,175,55,0.12)'}}>
            <p className="text-[8px] text-zinc-500 mb-0.5">Total Balance</p>
            <p className="text-base font-bold text-white">$12,450<span className="text-[10px] text-zinc-400">.80</span></p>
            <div className="flex items-center gap-1 mt-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[8px] text-emerald-400 font-medium">+5.2% today</span>
            </div>
          </div>

          <div className="flex justify-around px-3 mt-2.5">
            {[
              { label: 'Send', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> },
              { label: 'Receive', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/></svg> },
              { label: 'Buy', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> },
              { label: 'Swap', icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
            ].map(a => (
              <div key={a.label} className="flex flex-col items-center gap-1">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700/50 flex items-center justify-center text-gold-500/70">
                  {a.icon}
                </div>
                <span className="text-[7px] text-zinc-500">{a.label}</span>
              </div>
            ))}
          </div>

          <div className="px-3 mt-2.5 pb-3 space-y-1">
            {[
              { sym: 'GPG', amt: '45.2', val: '$2,260', pct: '+12.4%', up: true, color: '#D4AF37' },
              { sym: 'BTC', amt: '0.082', val: '$6,150', pct: '+3.1%', up: true, color: '#F7931A' },
              { sym: 'ETH', amt: '1.2', val: '$3,840', pct: '+2.8%', up: true, color: '#627EEA' },
              { sym: 'USDT', amt: '200', val: '$200', pct: '0.0%', up: true, color: '#26A17B' },
            ].map(c => (
              <div key={c.sym} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-[6px] font-bold text-white"
                    style={{background:`${c.color}20`, border:`1px solid ${c.color}30`}}>
                    {c.sym.slice(0,1)}
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold text-white">{c.sym}</p>
                    <p className="text-[7px] text-zinc-500">{c.amt}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-semibold text-white">{c.val}</p>
                  <p className={`text-[7px] ${c.up ? 'text-emerald-400' : 'text-red-400'}`}>{c.pct}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <motion.div animate={{ y: [-4, 4, -4] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -top-3 -right-8 md:-right-12 bg-zinc-900/90 border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            </svg>
          </div>
          <div>
            <p className="text-[8px] text-zinc-500">Portfolio</p>
            <p className="text-[10px] font-bold text-emerald-400">+$2,340</p>
          </div>
        </div>
      </motion.div>

      <motion.div animate={{ y: [3, -3, 3] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -bottom-2 -left-6 md:-left-10 bg-zinc-900/90 border border-white/[0.08] rounded-xl px-3 py-2 shadow-xl backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gold-500/15 flex items-center justify-center text-[8px] font-bold text-gold-400">GP</div>
          <div>
            <p className="text-[8px] text-zinc-500">GPG Price</p>
            <p className="text-[10px] font-bold text-gold-400">$50.00</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function ATMCard({ type = 'gold' }: { type?: 'gold' | 'black' }) {
  const isGold = type === 'gold';
  return (
    <div className={`w-[270px] md:w-[310px] h-[165px] md:h-[190px] rounded-2xl p-4 md:p-5 relative overflow-hidden shrink-0 ${
      isGold ? 'border border-gold-500/25' : 'border border-white/[0.08]'
    }`} style={{
      background: isGold
        ? 'linear-gradient(135deg, #151208 0%, #1f1a0d 40%, #151208 70%, #1f1a0d 100%)'
        : 'linear-gradient(135deg, #0f0f0f 0%, #161616 40%, #0f0f0f 70%, #161616 100%)',
    }}>
      <div className="absolute inset-0 opacity-15"
        style={{background:'linear-gradient(135deg, transparent 40%, rgba(212,175,55,0.08) 50%, transparent 60%)'}} />
      <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-full flex items-center text-[8px] font-bold text-black"
              style={{background:'linear-gradient(135deg,#FFD700,#D4AF37)'}}>GP</div>
            <span className="text-xs font-semibold text-white">GoldenPrime</span>
          </div>
          <div className={`px-1.5 py-0.5 rounded text-[8px] font-semibold tracking-wider ${isGold ? 'bg-gold-500/15 text-gold-400' : 'bg-white/[0.06] text-zinc-400'}`}>
            {isGold ? 'GOLD' : 'BLACK'}
          </div>
        </div>
        <div>
          <p className="text-sm md:text-base font-mono tracking-[0.18em] text-zinc-300 mb-1">**** **** **** 4829</p>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[8px] text-zinc-500 uppercase tracking-wider">Card Holder</p>
              <p className="text-[11px] text-zinc-300 font-medium">GoldenPrime User</p>
            </div>
            <div className="text-right">
              <p className="text-[8px] text-zinc-500">Expires</p>
              <p className="text-[11px] text-zinc-300 font-medium">12/28</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FEATURES = [
  { title: 'P2P Trading', desc: 'Trade GPG, BTC, ETH, SOL, USDT with other users via a secure escrow system.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg> },
  { title: 'Tiered Referrals', desc: 'Earn escalating GPG rewards from Bronze to Platinum based on your referral count.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
  { title: 'Visa Debit Card', desc: 'Spend crypto and gold tokens at millions of merchants worldwide with your GP card.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg> },
  { title: 'Secure Wallet', desc: 'Fund via bank transfer or card. Bank-grade encryption protects every transaction.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
  { title: 'Web3 Ready', desc: 'Connect MetaMask for seamless blockchain interactions and future DeFi features.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg> },
  { title: 'AI Assistant', desc: 'Get instant answers about GPG, trading, referrals, and the platform 24/7.', icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg> },
];

const ROADMAP = [
  { q: 'Q3 2026', title: 'Platform Launch', desc: 'Web platform, GPG preorders, KYC verification, and referral system go live.', active: true },
  { q: 'Q4 2026', title: 'GPG Token Launch', desc: 'Token Generation Event on BNB Chain. GPG listed on DEX. Visa card beta rollout.', active: false },
  { q: 'Q1 2027', title: 'P2P & DeFi', desc: 'P2P trading marketplace, MetaMask integration, staking, and liquidity pools.', active: false },
  { q: 'Q2 2027', title: 'Global Expansion', desc: 'Mobile app launch, multi-chain support, institutional partnerships, and CEX listings.', active: false },
];

export default function Home() {
  const [coinInfo, setCoinInfo] = useState<any>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/gold/coin`)
      .then(r => r.json())
      .then(setCoinInfo)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <Navbar />
      <LiveTicker />

      {/* Hero */}
      <section className="relative overflow-hidden pt-8 md:pt-16 pb-16 md:pb-24">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(212,175,55,0.08),transparent)]" />

        <div className="max-w-7xl mx-auto px-4 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="text-center lg:text-left order-2 lg:order-1">
              <FadeInUp>
                <div className="inline-flex items-center gap-2 mb-6 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-medium">Launching October 1, 2026</span>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.08}>
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold mb-6 leading-[1.08] tracking-tight">
                  Own Digital Gold.<br />
                  <span className="text-shimmer">Trade Without Limits.</span>
                </h1>
              </FadeInUp>

              <FadeInUp delay={0.16}>
                <p className="text-zinc-400 text-sm md:text-base max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed">
                  GoldenPrime combines tokenized gold investment, peer-to-peer crypto trading, and a Visa-powered debit card — all on the BNB Chain. Preorder GPG at <span className="text-gold-400 font-semibold">$50/coin</span>.
                </p>
              </FadeInUp>

              <FadeInUp delay={0.24}>
                <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8">
                  <Link href="/register"
                    className="group relative bg-gold-500 text-black px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-all text-center overflow-hidden shadow-lg shadow-gold-500/15">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Get Started Free
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </Link>
                  <Link href="/whitepaper"
                    className="border border-white/[0.1] px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/[0.04] hover:border-white/[0.15] transition-all text-center text-zinc-300">
                    Read Whitepaper
                  </Link>
                </div>
              </FadeInUp>

              <FadeInUp delay={0.32}>
                <div className="flex items-center gap-5 justify-center lg:justify-start">
                  {[
                    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, label: 'Bank-Grade Security', color: 'text-emerald-500' },
                    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>, label: 'KYC Verified', color: 'text-gold-500' },
                    { icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: 'Visa Card', color: 'text-blue-500' },
                  ].map(b => (
                    <div key={b.label} className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <span className={b.color}>{b.icon}</span>
                      {b.label}
                    </div>
                  ))}
                </div>
              </FadeInUp>
            </div>

            <div className="flex justify-center order-1 lg:order-2">
              <FadeInUp delay={0.15}>
                <PhoneMockup />
              </FadeInUp>
            </div>
          </div>
        </div>
      </section>

      {/* Trust logos / stats bar */}
      <section className="border-y border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-10">
          <FadeInUp>
            <div className="text-center mb-8">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Powered by</span>
            </div>
          </FadeInUp>
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4" delay={0.1}>
            {[
              { name: 'BNB Chain', stat: '$5.2B TVL', color: '#F3BA2F' },
              { name: 'Ethereum', stat: '$48B TVL', color: '#627EEA' },
              { name: 'Solana', stat: '$8.1B TVL', color: '#9945FF' },
              { name: 'Visa Network', stat: '190+ Countries', color: '#1A1F71' },
            ].map(c => (
              <StaggerItem key={c.name}>
                <motion.div whileHover={{ borderColor: 'rgba(255,255,255,0.1)' }}
                  className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 text-center transition-all">
                  <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{background:`${c.color}15`}}>
                    <div className="w-3 h-3 rounded-full" style={{background:c.color}} />
                  </div>
                  <p className="text-sm font-semibold text-white">{c.name}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{c.stat}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* GPG Coin Section */}
      <section id="gpg" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <FadeInUp>
            <div className="text-center lg:text-left">
              <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">The Coin</span>
              <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-4">
                GoldenPrime Gold Coin <span className="text-gold-400">(GPG)</span>
              </h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-6">
                GPG is a tokenized gold asset on the BNB Chain. Each coin represents $50 worth of gold-backed digital value with a total supply of 1,000,000 coins. Secure your position before the official launch.
              </p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {[
                  { label: 'Price', value: '$50', sub: 'per coin' },
                  { label: 'Total Supply', value: '1,000,000', sub: 'GPG' },
                  { label: 'Network', value: 'BNB Chain', sub: 'BEP-20' },
                  { label: 'Launch', value: 'Oct 1, 2026', sub: 'TGE' },
                ].map(item => (
                  <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 text-center lg:text-left">
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{item.label}</p>
                    <p className="text-base font-bold text-gold-400 mt-0.5">{item.value}</p>
                    <p className="text-[10px] text-zinc-600">{item.sub}</p>
                  </div>
                ))}
              </div>
              {coinInfo && (
                <div>
                  <div className="flex justify-between text-xs text-zinc-500 mb-1.5">
                    <span>{coinInfo.totalSold?.toLocaleString(undefined, {maximumFractionDigits:0})} sold</span>
                    <span>{coinInfo.remaining?.toLocaleString(undefined, {maximumFractionDigits:0})} remaining</span>
                  </div>
                  <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(parseFloat(coinInfo.percentSold) || 0, 100)}%` }}
                      transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                      className="h-2 rounded-full" style={{background:'linear-gradient(90deg,#D4AF37,#FFD700)'}} />
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

      {/* Features */}
      <section id="features" className="border-y border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <FadeInUp>
            <div className="text-center mb-12">
              <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">Platform</span>
              <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">Everything You Need</h2>
              <p className="text-zinc-400 text-sm md:text-base max-w-md mx-auto">
                Invest, trade, and spend — all from one secure platform
              </p>
            </div>
          </FadeInUp>
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" delay={0.08}>
            {FEATURES.map(f => (
              <StaggerItem key={f.title}>
                <motion.div whileHover={{ y: -4, borderColor: 'rgba(212,175,55,0.25)' }}
                  className="bg-zinc-900/40 border border-white/[0.06] rounded-2xl p-5 md:p-6 transition-all h-full group">
                  <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-500 mb-4 group-hover:bg-gold-500/15 transition-colors">
                    {f.icon}
                  </div>
                  <h3 className="text-base font-semibold mb-2">{f.title}</h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Cards */}
      <section id="cards" className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
        <FadeInUp>
          <div className="text-center mb-10 md:mb-14">
            <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">GoldenPrime Cards</span>
            <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">Spend Your Crypto Anywhere</h2>
            <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto">
              Link your GoldenPrime wallet to a Visa-powered debit card. Spend GPG, BTC, ETH, and more at millions of merchants worldwide.
            </p>
          </div>
        </FadeInUp>
        <FadeInUp delay={0.15}>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-8 mb-10">
            <motion.div whileHover={{ y: -6, rotateY: 3 }} transition={{ type: 'spring', stiffness: 300 }}>
              <ATMCard type="gold" />
            </motion.div>
            <motion.div whileHover={{ y: -6, rotateY: -3 }} transition={{ type: 'spring', stiffness: 300 }}>
              <ATMCard type="black" />
            </motion.div>
          </div>
        </FadeInUp>
        <FadeInUp delay={0.25}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {[
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>, label: 'Visa Accepted' },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>, label: 'Global Spending' },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>, label: 'Instant Freeze' },
              { icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>, label: 'Cashback Rewards' },
            ].map(item => (
              <div key={item.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3.5 text-center">
                <div className="text-gold-500 flex justify-center mb-2">{item.icon}</div>
                <p className="text-xs text-zinc-400 font-medium">{item.label}</p>
              </div>
            ))}
          </div>
        </FadeInUp>
      </section>

      {/* Roadmap */}
      <section id="roadmap" className="border-y border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <FadeInUp>
            <div className="text-center mb-12">
              <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">Roadmap</span>
              <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">Building the Future of Digital Gold</h2>
            </div>
          </FadeInUp>
          <div className="relative">
            <div className="absolute left-[18px] md:left-1/2 top-0 bottom-0 w-px bg-white/[0.06] md:-translate-x-px" />
            <div className="space-y-8 md:space-y-12">
              {ROADMAP.map((item, i) => (
                <FadeInUp key={item.q} delay={i * 0.1}>
                  <div className={`relative flex gap-4 md:gap-0 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                    <div className="absolute left-[18px] md:left-1/2 w-3 h-3 rounded-full border-2 -translate-x-1.5 md:-translate-x-1.5 mt-5 z-10"
                      style={{
                        borderColor: item.active ? '#D4AF37' : 'rgba(255,255,255,0.15)',
                        background: item.active ? '#D4AF37' : '#0a0a0a',
                      }} />
                    <div className={`flex-1 pl-10 md:pl-0 ${i % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                      <span className="text-xs font-semibold text-gold-500 uppercase tracking-wider">{item.q}</span>
                      <h3 className="text-base md:text-lg font-bold mt-1">{item.title}</h3>
                      <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                    <div className="hidden md:block flex-1" />
                  </div>
                </FadeInUp>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Countdown + Stats */}
      <section className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <FadeInUp>
          <p className="text-zinc-500 mb-4 text-xs uppercase tracking-[0.2em] font-medium">Time Until GPG Launch</p>
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
                <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4">
                  <p className="text-lg md:text-2xl font-bold text-gold-400">{s.value}</p>
                  <p className="text-[10px] md:text-xs text-zinc-500 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </FadeInUp>
        )}
      </section>

      {/* Referral */}
      <section className="border-y border-white/[0.06] bg-white/[0.01]">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-24">
          <FadeInUp>
            <div className="relative bg-gradient-to-br from-gold-500/[0.06] via-zinc-900/80 to-zinc-900/80 border border-gold-500/15 rounded-3xl p-8 md:p-12 text-center overflow-hidden">
              <div className="absolute top-0 right-0 w-72 h-72 bg-gold-500/[0.04] rounded-full blur-[120px]" />
              <span className="text-gold-500 text-xs font-semibold uppercase tracking-[0.15em]">Referral Program</span>
              <h2 className="text-2xl md:text-4xl font-bold mt-2 mb-3">Refer & Earn Gold</h2>
              <p className="text-zinc-400 mb-8 max-w-xl mx-auto text-sm md:text-base leading-relaxed">
                Share your referral code. Earn <span className="text-gold-400 font-semibold">GPG rewards</span> for every friend who joins. Higher tier means more gold per referral.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto mb-8">
                {[
                  { tier: 'Bronze', reward: '0.0001', req: '1-4 refs', color: '#CD7F32' },
                  { tier: 'Silver', reward: '0.0002', req: '5-14 refs', color: '#C0C0C0' },
                  { tier: 'Gold', reward: '0.0005', req: '15-49 refs', color: '#FFD700' },
                  { tier: 'Platinum', reward: '0.001', req: '50+ refs', color: '#E5E4E2' },
                ].map(t => (
                  <motion.div key={t.tier} whileHover={{ y: -4, scale: 1.02 }}
                    className="bg-zinc-900/80 border border-white/[0.06] rounded-xl p-4 text-center">
                    <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center"
                      style={{ background:`${t.color}12`, border:`1px solid ${t.color}25` }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.color} strokeWidth="2">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                      </svg>
                    </div>
                    <div className="text-xs font-semibold" style={{ color: t.color }}>{t.tier}</div>
                    <div className="text-base md:text-lg font-bold text-white mt-1">{t.reward} GPG</div>
                    <div className="text-[9px] text-zinc-500">{t.req}</div>
                  </motion.div>
                ))}
              </div>
              <Link href="/register"
                className="bg-gold-500 text-black px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-all inline-block shadow-lg shadow-gold-500/10">
                Start Earning
              </Link>
            </div>
          </FadeInUp>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-4xl mx-auto px-4 md:px-6 py-16 md:py-24 text-center">
        <FadeInUp>
          <h2 className="text-2xl md:text-4xl font-bold mb-4">Ready to Own Digital Gold?</h2>
          <p className="text-zinc-400 mb-8 text-sm md:text-base max-w-lg mx-auto">
            Join thousands of investors preordering GoldenPrime Gold Coin. Secure your GPG at $50 before the October 2026 launch.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register"
              className="bg-gold-500 text-black px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-gold-400 transition-all text-center shadow-lg shadow-gold-500/10">
              Create Free Account
            </Link>
            <Link href="/whitepaper"
              className="border border-white/[0.1] px-7 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/[0.04] hover:border-white/[0.15] transition-all text-center text-zinc-300">
              Read Whitepaper
            </Link>
          </div>
        </FadeInUp>
      </section>

      <Footer />
    </main>
  );
}
