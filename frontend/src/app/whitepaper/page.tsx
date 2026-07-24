'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const ROADMAP = [
  {
    phase: 'Phase 1',
    title: 'Foundation',
    date: 'Q1 2026',
    status: 'completed',
    items: [
      'Platform development and core architecture',
      'User authentication and wallet system',
      'GPG coin pre-order system',
      'Admin dashboard and payment processing',
    ],
  },
  {
    phase: 'Phase 2',
    title: 'Growth',
    date: 'Q2 2026',
    status: 'completed',
    items: [
      'Tiered referral system (Bronze to Platinum)',
      'Real-time crypto price integration',
      'KYC verification system',
      'Enhanced security features',
    ],
  },
  {
    phase: 'Phase 3',
    title: 'Trading',
    date: 'Q3 2026',
    status: 'completed',
    items: [
      'P2P trading marketplace',
      'Order book with buy/sell matching',
      'Escrow system for secure trades',
      'Multi-coin support (BTC, ETH, SOL, USDT, USDC)',
    ],
  },
  {
    phase: 'Phase 4',
    title: 'Web3 Integration',
    date: 'Q3 2026',
    status: 'completed',
    items: [
      'MetaMask wallet connection',
      'On-chain transaction support',
      'Web3 wallet management',
      'Trade chat and communication',
    ],
  },
  {
    phase: 'Phase 5',
    title: 'Launch',
    date: 'Q4 2026',
    status: 'upcoming',
    items: [
      'GPG Token Generation Event (TGE)',
      'DEX listing and liquidity pools',
      'Staking and yield farming',
      'Mobile app beta',
    ],
  },
  {
    phase: 'Phase 6',
    title: 'Expansion',
    date: 'Q1 2027',
    status: 'upcoming',
    items: [
      'CEX listings (Tier 1 and Tier 2 exchanges)',
      'GPG debit card for everyday spending',
      'Institutional partnerships',
      'Cross-chain bridge deployment',
    ],
  },
];

const TOKENOMICS = [
  { label: 'Public Sale', percent: 40, color: 'bg-gold-500' },
  { label: 'Team & Advisors', percent: 15, color: 'bg-blue-500' },
  { label: 'Staking Rewards', percent: 20, color: 'bg-green-500' },
  { label: 'Liquidity Pool', percent: 10, color: 'bg-purple-500' },
  { label: 'Marketing', percent: 10, color: 'bg-orange-500' },
  { label: 'Reserve', percent: 5, color: 'bg-zinc-500' },
];

const TEAM = [
  { name: 'GoldenPrime Team', role: 'Core Development', avatar: '🪙' },
  { name: 'Community', role: 'Ecosystem Growth', avatar: '🌍' },
  { name: 'Partners', role: 'Strategic Advisors', avatar: '🎯' },
];

export default function WhitepaperPage() {
  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</Link>
        <div className="flex gap-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link>
          <Link href="/preorder" className="bg-gold-500 text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gold-400">Preorder GPG</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gold-500 to-amber-600 rounded-full flex items-center justify-center text-5xl shadow-lg shadow-gold-500/30"
          >
            {'🪙'}
          </motion.div>
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gold-500">Golden</span>Prime Whitepaper
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A comprehensive overview of the GoldenPrime Gold Coin (GPG) ecosystem,
            tokenomics, and roadmap for the future of tokenized gold investment.
          </p>
        </motion.div>

        {/* Executive Summary */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Executive Summary</h2>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
            <p className="text-gray-300 leading-relaxed mb-4">
              GoldenPrime (GP) is a next-generation crypto investment platform designed to democratize access to
              gold-backed digital assets. Our flagship product, the GoldenPrime Gold Coin (GPG), represents a new
              paradigm in tokenized precious metals, combining the stability of gold with the innovation of
              blockchain technology.
            </p>
            <p className="text-gray-300 leading-relaxed mb-4">
              Each GPG coin is pegged to $50 USD during the pre-order phase, with a total supply of 1,000,000 coins.
              The platform offers P2P trading, tiered referral rewards, and a comprehensive ecosystem that bridges
              traditional finance with decentralized innovation.
            </p>
            <p className="text-gray-300 leading-relaxed">
              Our mission is to make gold investment accessible, transparent, and profitable for everyone, regardless
              of geographic location or investment experience. By leveraging blockchain technology, we ensure that every
              transaction is verifiable, every holding is auditable, and every participant is empowered.
            </p>
          </div>
        </motion.section>

        {/* Tokenomics */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
          <h2 className="text-3xl font-bold mb-6">GPG Tokenomics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Distribution */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Token Distribution</h3>
              <div className="space-y-3">
                {TOKENOMICS.map((t) => (
                  <div key={t.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{t.label}</span>
                      <span className="font-bold">{t.percent}%</span>
                    </div>
                    <div className="w-full bg-zinc-800 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${t.percent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className={`${t.color} h-2 rounded-full`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Stats */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-4">Key Metrics</h3>
              <div className="space-y-4">
                {[
                  { label: 'Token Name', value: 'GoldenPrime Gold Coin' },
                  { label: 'Symbol', value: 'GPG' },
                  { label: 'Total Supply', value: '1,000,000 GPG' },
                  { label: 'Pre-order Price', value: '$50 / GPG' },
                  { label: 'Launch Date', value: 'October 1, 2026' },
                  { label: 'Blockchain', value: 'Ethereum (ERC-20)' },
                  { label: 'Initial Market Cap', value: '$50,000,000' },
                  { label: 'Backing', value: 'Gold Reserves + USD Collateral' },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-0">
                    <span className="text-sm text-gray-400">{stat.label}</span>
                    <span className="text-sm font-semibold">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        {/* Technology */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                title: 'Frontend',
                icon: '🌐',
                items: ['Next.js 14 (React)', 'Tailwind CSS', 'Framer Motion', 'WebSocket Real-time'],
              },
              {
                title: 'Backend',
                icon: '\u2699\uFE0F',
                items: ['Node.js / Express', 'PostgreSQL (Supabase)', 'JWT Authentication', 'RESTful API'],
              },
              {
                title: 'Blockchain',
                icon: '🔗',
                items: ['Ethereum (ERC-20)', 'MetaMask Integration', 'Web3.js / Ethers', 'Smart Contracts'],
              },
            ].map((stack) => (
              <div key={stack.title} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="text-3xl mb-3">{stack.icon}</div>
                <h3 className="text-lg font-semibold mb-3">{stack.title}</h3>
                <ul className="space-y-2">
                  {stack.items.map((item) => (
                    <li key={item} className="text-sm text-gray-400 flex items-center gap-2">
                      <span className="text-gold-500">&#8226;</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Roadmap */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Roadmap</h2>
          <div className="relative">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-zinc-800" />
            {ROADMAP.map((item, i) => (
              <motion.div
                key={item.phase}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative mb-8 flex ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`w-full md:w-1/2 ${i % 2 === 0 ? 'md:pr-8 md:text-right' : 'md:pl-8'} pl-12 md:pl-0`}>
                  <div className={`bg-zinc-900 border rounded-xl p-6 ${
                    item.status === 'completed' ? 'border-green-500/30' :
                    item.status === 'upcoming' ? 'border-gold-500/30' : 'border-zinc-800'
                  }`}>
                    <div className="flex items-center gap-2 mb-2 justify-start md:justify-end">
                      {item.status === 'completed' && <span className="text-green-500 text-sm">&#10003; Complete</span>}
                      {item.status === 'upcoming' && <span className="text-gold-500 text-sm">&#9670; Upcoming</span>}
                    </div>
                    <span className="text-xs text-gray-500 font-semibold uppercase">{item.phase} &middot; {item.date}</span>
                    <h3 className="text-xl font-bold mt-1 mb-3">{item.title}</h3>
                    <ul className="space-y-1">
                      {item.items.map((task) => (
                        <li key={task} className="text-sm text-gray-400">{task}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className={`absolute left-2 md:left-1/2 md:-translate-x-1/2 w-4 h-4 rounded-full border-2 ${
                  item.status === 'completed' ? 'bg-green-500 border-green-500' :
                  item.status === 'upcoming' ? 'bg-gold-500 border-gold-500' : 'bg-zinc-700 border-zinc-600'
                }`} />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Team */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-16">
          <h2 className="text-3xl font-bold mb-6">Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TEAM.map((member) => (
              <div key={member.name} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">{member.avatar}</div>
                <h3 className="text-lg font-semibold">{member.name}</h3>
                <p className="text-sm text-gray-400">{member.role}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* CTA */}
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="text-center bg-gradient-to-r from-gold-500/10 to-zinc-900 border border-gold-500/30 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Join the GoldenPrime Revolution</h2>
          <p className="text-gray-400 mb-8 max-w-lg mx-auto">
            Be part of the future of gold investment. Preorder GPG coins today and earn rewards by referring others.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/preorder" className="bg-gold-500 text-black px-8 py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors">
              Preorder GPG
            </Link>
            <Link href="/register" className="border border-zinc-700 px-8 py-3 rounded-lg font-semibold hover:bg-zinc-800 transition-colors">
              Create Account
            </Link>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
