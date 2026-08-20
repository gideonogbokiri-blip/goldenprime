'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, goldAPI, walletAPI, tradingAPI, settingsAPI } from '@/lib/api';
import CryptoPrices from '@/components/CryptoPrices';
import MarketChart from '@/components/MarketChart';
import { SkeletonCard } from '@/components/ui/Skeleton';
import BrandLogo from '@/components/ui/BrandLogo';
import DepositFeed from '@/components/DepositFeed';

const TxIcon = ({ type }: { type: string }) => {
  const c = "w-4 h-4"; const b = "w-8 h-8 rounded-lg flex items-center justify-center shrink-0";
  switch (type) {
    case 'deposit': return <div className={`${b} bg-emerald-500/15`}><svg className={`${c} text-emerald-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg></div>;
    case 'withdrawal': return <div className={`${b} bg-blue-500/15`}><svg className={`${c} text-blue-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/></svg></div>;
    case 'purchase': case 'preorder': return <div className={`${b} bg-gold-500/15`}><svg className={`${c} text-gold-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="bold" stroke="none">$</text></svg></div>;
    case 'sell': return <div className={`${b} bg-purple-500/15`}><svg className={`${c} text-purple-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg></div>;
    case 'referral_reward': return <div className={`${b} bg-amber-500/15`}><svg className={`${c} text-amber-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg></div>;
    case 'trade': return <div className={`${b} bg-cyan-500/15`}><svg className={`${c} text-cyan-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg></div>;
    default: return <div className={`${b} bg-zinc-500/15`}><svg className={`${c} text-zinc-400`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg></div>;
  }
};

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

const NAV = [
  { href: '/trade', label: 'Trade', gold: true },
  { href: '/wallet', label: 'Wallet', gold: false },
  { href: '/referrals', label: 'Referrals', gold: false },
  { href: '/kyc', label: 'KYC', gold: false },
  { href: '/web3', label: 'Web3', gold: false },
  { href: '/security', label: 'Security', gold: false },
  { href: '/profile', label: 'Profile', gold: false },
];

const QUICK_ACTIONS = [
  { href: '/trade', label: 'Trade', gold: true, type: 'trade' },
  { href: '/wallet', label: 'Fund Wallet', gold: false, type: 'wallet' },
  { href: '/wallet', label: 'Withdraw', gold: false, type: 'withdraw' },
  { href: '/referrals', label: 'Refer & Earn', gold: false, type: 'referrals' },
  { href: '/kyc', label: 'KYC Verify', gold: false, type: 'kyc' },
];

function ActionIcon({ type }: { type: string }) {
  switch (type) {
    case 'trade': return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>;
    case 'wallet': return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case 'withdraw': return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 0 0-8 0v2"/></svg>;
    case 'referrals': return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case 'kyc': return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>;
    default: return null;
  }
}

function StatCard({ label, value, sub, gold = false }: { label: string; value: string; sub?: string; gold?: boolean }) {
  return (
    <motion.div variants={item} whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.1)' }}
      className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 md:p-5 transition-all hover:shadow-xl hover:shadow-black/20 h-full flex flex-col justify-between group">
      <p className="text-zinc-500 text-[11px] md:text-xs font-medium tracking-wide">{label}</p>
      <p className={`text-xl md:text-2xl font-bold mt-1.5 ${gold ? 'text-gold-400' : 'text-white'}`}>{value}</p>
      {sub && <p className="text-zinc-600 text-[10px] md:text-xs mt-1.5">{sub}</p>}
    </motion.div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [referral, setReferral] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [expectedRate, setExpectedRate] = useState(3);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening');
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    Promise.all([
      authAPI.getMe().then(r => setUser(r.data.user)),
      tradingAPI.getPortfolio().catch(() => ({ data: { holdings: [], totalValue: 0 } })).then(r => setPortfolio(r.data)),
      goldAPI.getReferralInfo().then(r => setReferral(r.data)).catch(() => {}),
      walletAPI.getWallets().then(r => setWallets(r.data.wallets)),
      walletAPI.getTransactions(10).then(r => setTransactions(r.data.transactions)),
      settingsAPI.getPublic().then(r => setExpectedRate(r.data.expectedProfitRate)).catch(() => {}),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken'); localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const copyReferral = () => {
    if (referral?.referralLink) navigator.clipboard.writeText(referral.referralLink);
    else if (referral?.referralCode) navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referral.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950">
        <nav className="border-b border-white/[0.06] px-4 md:px-6 h-16 flex items-center justify-between bg-zinc-950/80 backdrop-blur-xl">
          <BrandLogo size={28} />
          <div className="skeleton h-4 w-32 rounded" />
        </nav>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
          <div className="skeleton h-7 w-56 mb-6 md:mb-8 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
          <div className="skeleton h-48 rounded-xl mb-6 md:mb-8" />
          <div className="skeleton h-80 rounded-xl mb-6 md:mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-2 skeleton h-64 rounded-xl" />
            <div className="space-y-4 md:space-y-6">
              <div className="skeleton h-48 rounded-xl" />
              <div className="skeleton h-48 rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const usdWallet = wallets.find((w: any) => w.currency === 'USD');
  const usd = usdWallet ? parseFloat(usdWallet.balance) : 0;
  const cryptoValue = portfolio?.totalValue || 0;
  const totalValue = usd + cryptoValue;
  const expectedProfit = (usd * (expectedRate || 0)) / 100;

  return (
    <main className="min-h-screen bg-zinc-950">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-zinc-950/70 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <BrandLogo size={28} href="/dashboard" />
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV.map(l => l.gold ? (
              <Link key={l.href} href={l.href}
                className="px-3 py-1.5 text-[12px] font-semibold bg-gold-500 text-black rounded-lg hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10 whitespace-nowrap">{l.label}</Link>
            ) : (
              <Link key={l.href} href={l.href}
                className="px-3 py-1.5 text-[12px] font-medium text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.05] transition-all whitespace-nowrap">{l.label}</Link>
            ))}
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <span className="text-[12px] text-zinc-500 truncate max-w-[140px]">{user?.email}</span>
            <button onClick={handleLogout}
              className="text-[12px] text-zinc-500 hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-all">Sign Out</button>
          </div>
          <button onClick={() => setMobileNav(!mobileNav)} className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/[0.06] transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
              {mobileNav ? <path d="M6 6l12 12M6 18L18 6" /> : <><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="4" y1="17" x2="20" y2="17" /></>}
            </svg>
          </button>
        </div>
      </nav>
      <AnimatePresence>
        {mobileNav && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="fixed top-16 left-0 right-0 z-40 lg:hidden border-b border-white/[0.06] bg-zinc-950/95 backdrop-blur-2xl">
            <div className="px-4 py-4 flex flex-col gap-0.5 max-h-[70vh] overflow-y-auto">
              {NAV.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMobileNav(false)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg transition-all ${l.gold ? 'bg-gold-500 text-black text-center' : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'}`}>{l.label}</Link>
              ))}
              <div className="border-t border-white/[0.06] mt-2 pt-3 flex items-center justify-between px-1">
                <span className="text-xs text-zinc-500 truncate max-w-[60%]">{user?.email}</span>
                <button onClick={handleLogout} className="text-xs text-zinc-500 hover:text-white transition-colors">Sign Out</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <DepositFeed />

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Greeting */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }} className="mb-6 md:mb-8">
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium uppercase tracking-wider mb-1">Good {greeting}</div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {user?.first_name || 'Investor'} <span className="text-gold-400">&#8226;</span>
          </h1>
          <p className="text-zinc-500 text-sm mt-1">Your GoldenPrime portfolio overview</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
          <StatCard label="Expected Profit (monthly)" value={`$${expectedProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub={`${expectedRate}% on your balance`} gold />
          <StatCard label="USD Balance" value={`$${usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub="Available balance" />
          <StatCard label="Portfolio Value" value={`$${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}`} sub="Cash + crypto holdings" />
          <StatCard label="Referrals" value={`${referral?.referralCount || 0}`} sub={`$${(referral?.earnings || 0).toFixed(2)} earned`} />
        </motion.div>

        {/* Coming Soon banner */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-gradient-to-r from-gold-500/[0.04] via-zinc-900 to-zinc-900 border border-gold-500/15 rounded-xl p-4 md:p-6 mb-6 md:mb-8 relative overflow-hidden group">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gold-500/[0.03] rounded-full blur-[60px] group-hover:scale-150 transition-transform duration-1000" />
          <div className="relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/15 flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4l2.5 2.5"/></svg>
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-semibold">Coming Soon</h3>
                  <p className="text-xs text-zinc-500">Our full investment suite &amp; advanced features are being prepared.</p>
                </div>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-gold-500/15 border border-gold-500/25 text-gold-400 text-xs font-semibold whitespace-nowrap">Stay tuned</span>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.5 }}
          className="mb-6 md:mb-8">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 md:p-6">
            <MarketChart />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 md:p-6">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {QUICK_ACTIONS.map(a => (
                  <motion.div key={a.href + a.type} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link href={a.href}
                      className={`flex flex-col items-center gap-2 py-4 rounded-xl font-semibold transition-all text-center text-xs ${
                        a.gold
                          ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-lg shadow-gold-500/15'
                          : 'bg-white/[0.04] border border-white/[0.06] text-zinc-300 hover:bg-white/[0.08] hover:border-white/[0.1]'
                      }`}>
                      <div className={`${a.gold ? '' : 'text-zinc-400'}`}><ActionIcon type={a.type} /></div>
                      {a.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Prices */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 md:p-6">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">Market Prices</h3>
              <CryptoPrices />
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Referral */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4, duration: 0.5 }}
              className="relative bg-gradient-to-br from-gold-500/[0.06] via-zinc-900 to-zinc-900 border border-gold-500/15 rounded-xl p-4 md:p-6 overflow-hidden">
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gold-500/[0.04] rounded-full blur-[50px]" />
              <div className="relative">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-3">Referral</h3>
                <p className="text-2xl font-bold text-gold-400 mb-1">{referral?.referralCount || 0}</p>
                <p className="text-xs text-zinc-500 mb-4">{referral?.referralCount === 1 ? 'Referral' : 'Total Referrals'}</p>
                <p className="text-xs text-zinc-400 mb-2">Earn <span className="text-gold-400 font-semibold">${referral?.rewardPerReferral || 5}</span> per referral</p>
                <div className="relative">
                  <input readOnly value={copied ? 'Copied!' : (referral?.referralCode || '')}
                    onClick={copyReferral}
                    className="w-full bg-zinc-800/80 border border-zinc-700/80 rounded-lg py-2.5 px-3 text-xs font-mono text-zinc-400 cursor-pointer mb-2 outline-none"
                    placeholder="Loading..." />
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={copyReferral}
                  className="w-full bg-gold-500 text-black py-2.5 rounded-lg font-semibold text-sm hover:bg-gold-400 transition-all shadow-lg shadow-gold-500/10">
                  {copied ? 'Copied!' : 'Copy Referral Link'}
                </motion.button>
                <Link href="/referrals" className="block text-center text-xs text-gold-500/70 hover:text-gold-400 mt-3 transition-colors">View leaderboard &rarr;</Link>
              </div>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45, duration: 0.5 }}
              className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Activity</h3>
                <Link href="/wallet" className="text-xs text-gold-500/70 hover:text-gold-400 transition-colors">View All</Link>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-500"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
                  </div>
                  <p className="text-zinc-400 text-sm">No activity yet</p>
                  <Link href="/wallet" className="text-gold-500 text-xs hover:underline mt-1 inline-block">Fund your wallet &rarr;</Link>
                </div>
              ) : (
                <motion.div variants={container} initial="hidden" animate="show" className="space-y-1">
                  {transactions.slice(0, 8).map((tx: any, i: number) => {
                    const isPos = tx.type === 'deposit' || tx.type === 'sell' || tx.type === 'referral_reward';
                    return (
                      <motion.div key={tx.id} variants={item}
                        className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-white/[0.03] transition-colors">
                        <TxIcon type={tx.type} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize truncate">{tx.type.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] text-zinc-500">{tx.currency} &bull; {new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-mono font-semibold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPos ? '+' : '-'}${parseFloat(tx.usd_value || tx.amount).toFixed(2)}
                          </p>
                          <p className={`text-[10px] ${tx.status === 'completed' ? 'text-emerald-500' : tx.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{tx.status}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}