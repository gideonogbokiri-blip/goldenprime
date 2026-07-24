'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI, goldAPI, walletAPI } from '@/lib/api';
import CryptoPrices from '@/components/CryptoPrices';
import CoinFlip from '@/components/ui/CoinFlip';
import MarketChart from '@/components/MarketChart';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { StaggerContainer, StaggerItem } from '@/components/ui/Animations';
import ChatBot from '@/components/ChatBot';
import BrandLogo from '@/components/ui/BrandLogo';

const TX_ICONS: Record<string, string> = {
  deposit: '💵',
  withdrawal: '🏦',
  purchase: '🪙',
  preorder: '🪙',
  sell: '📊',
  referral_reward: '🎁',
  trade: '🔄',
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any>(null);
  const [referral, setReferral] = useState<any>(null);
  const [tierInfo, setTierInfo] = useState<any>(null);
  const [coinInfo, setCoinInfo] = useState<any>(null);
  const [wallets, setWallets] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    Promise.all([
      authAPI.getMe().then(r => setUser(r.data.user)),
      goldAPI.getPortfolio().then(r => setPortfolio(r.data)),
      goldAPI.getReferralInfo().then(r => { setReferral(r.data); setTierInfo(r.data.tier); }),
      goldAPI.getCoinInfo().then(r => setCoinInfo(r.data)),
      walletAPI.getWallets().then(r => setWallets(r.data.wallets)),
      walletAPI.getTransactions(10).then(r => setTransactions(r.data.transactions)),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    router.push('/login');
  };

  const copyReferral = () => {
    if (referral?.referralLink) {
      navigator.clipboard.writeText(referral.referralLink);
    } else if (referral?.referralCode) {
      navigator.clipboard.writeText(`${window.location.origin}/register?ref=${referral.referralCode}`);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950">
        <nav className="border-b border-zinc-800 px-4 md:px-6 py-4 flex justify-between items-center">
          <BrandLogo size={32} />
          <div className="skeleton h-4 w-32 rounded" />
        </nav>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
          <div className="skeleton h-8 w-64 mb-6 md:mb-8 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
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

  const gpgBalance = portfolio?.holdings?.find((h: any) => h.currency === 'GPG');
  const usdBalance = wallets.find((w: any) => w.currency === 'USD');
  const totalValue = portfolio?.totalValue || 0;
  const usd = usdBalance ? parseFloat(usdBalance.balance) : 0;
  const gpgQty = gpgBalance ? parseFloat(gpgBalance.balance) : 0;
  const gpgValue = gpgQty * 50;
  const totalInvested = totalValue;
  const profitLoss = totalValue - totalInvested;

  const navLinks = (
    <>
      <Link href="/preorder" className="bg-gold-500 text-black px-3 md:px-4 py-2 rounded-lg font-semibold hover:bg-gold-400 transition-colors text-xs md:text-sm whitespace-nowrap">Preorder GPG</Link>
      <Link href="/trade" className="bg-zinc-800 border border-zinc-700 px-3 md:px-4 py-2 rounded-lg font-semibold hover:bg-zinc-700 transition-colors text-xs md:text-sm whitespace-nowrap">Trade</Link>
      <Link href="/wallet" className="text-gray-400 hover:text-white text-xs md:text-sm whitespace-nowrap">Wallet</Link>
      <Link href="/referrals" className="text-gray-400 hover:text-white text-xs md:text-sm whitespace-nowrap">Referrals</Link>
      <Link href="/kyc" className="text-gray-400 hover:text-white text-xs md:text-sm whitespace-nowrap">KYC</Link>
      <Link href="/web3" className="text-gray-400 hover:text-white text-xs md:text-sm whitespace-nowrap">Web3</Link>
      <Link href="/security" className="text-gray-400 hover:text-white text-xs md:text-sm whitespace-nowrap">Security</Link>
      <Link href="/profile" className="text-gray-400 hover:text-white text-xs md:text-sm whitespace-nowrap">Profile</Link>
      {user?.role === 'admin' && <Link href="/admin" className="text-gold-500 font-semibold text-xs md:text-sm whitespace-nowrap">Admin</Link>}
    </>
  );

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 backdrop-blur-xl bg-zinc-950/80 px-4 md:px-6 py-4 flex justify-between items-center">
        <BrandLogo size={32} href="/dashboard" />
        <div className="hidden lg:flex items-center gap-4">
          {navLinks}
          <span className="text-gray-400 text-sm">{user?.email}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors text-sm">Sign Out</button>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden text-gray-400 hover:text-white p-2">
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2"><path d={mobileMenuOpen ? "M6 6l12 12M6 18L18 6" : "M4 6h16M4 12h16M4 18h16"} /></svg>
        </button>
      </nav>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="lg:hidden border-b border-zinc-800 bg-zinc-900 overflow-hidden">
            <div className="px-4 py-4 flex flex-col gap-2">
              {navLinks}
              <div className="border-t border-zinc-800 mt-2 pt-2 flex items-center justify-between">
                <span className="text-gray-400 text-sm truncate max-w-[60%]">{user?.email}</span>
                <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors text-sm">Sign Out</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Welcome */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-semibold mb-1">Welcome, {user?.first_name || 'Investor'}</h2>
          <p className="text-gray-400 text-sm md:text-base">Your GoldenPrime portfolio overview</p>
        </motion.div>

        {/* Portfolio Cards - Row 1 */}
        <StaggerContainer className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-6 md:mb-8" stagger={0.06}>
          <StaggerItem>
            <CoinFlip balance={gpgBalance ? gpgBalance.balance : 0} />
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -4 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5 transition-shadow hover:shadow-lg hover:shadow-zinc-800/50 h-full flex flex-col justify-between">
              <div>
                <p className="text-gray-400 text-[11px] md:text-xs mb-1">USD Balance</p>
                <p className="text-xl md:text-2xl font-bold">${usd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <Link href="/wallet" className="text-[10px] md:text-xs text-gold-500 hover:underline mt-2">Fund Wallet &rarr;</Link>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -4 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5 transition-shadow hover:shadow-lg hover:shadow-zinc-800/50 h-full flex flex-col justify-between">
              <div>
                <p className="text-gray-400 text-[11px] md:text-xs mb-1">Portfolio Value</p>
                <p className="text-xl md:text-2xl font-bold text-green-500">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-2">Estimated total</p>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -4 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5 transition-shadow hover:shadow-lg hover:shadow-zinc-800/50 h-full flex flex-col justify-between">
              <div>
                <p className="text-gray-400 text-[11px] md:text-xs mb-1">Profit / Loss</p>
                <p className={`text-xl md:text-2xl font-bold ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 mt-2">Since inception</p>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -4 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-5 transition-shadow hover:shadow-lg hover:shadow-zinc-800/50 h-full flex flex-col justify-between">
              <div>
                <p className="text-gray-400 text-[11px] md:text-xs mb-1">Referrals</p>
                <p className="text-xl md:text-2xl font-bold text-gold-500">{referral?.referralCount || 0}</p>
              </div>
              <p className="text-[10px] md:text-xs text-gold-500 mt-2">{referral?.earnings?.toFixed(4) || '0.0000'} GPG earned</p>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* GPG Coin Progress */}
        {coinInfo && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 mb-6 md:mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gold-500/15 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 100 100"><defs><linearGradient id="dgp" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#FFD700"/><stop offset="100%" stopColor="#B8960F"/></linearGradient></defs><circle cx="50" cy="50" r="46" fill="url(#dgp)"/><text x="50" y="56" textAnchor="middle" fill="#000" fontWeight="800" fontSize="18" fontFamily="system-ui">GP</text></svg>
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">GoldenPrime Gold Coin (GPG)</h3>
                  <p className="text-xs text-gray-500">Preorder phase — launching Oct 1, 2026</p>
                </div>
              </div>
              <Link href="/preorder" className="bg-gold-500 text-black px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gold-400 whitespace-nowrap">Preorder Now</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4 mb-4">
              <div><p className="text-xs text-gray-400">Price</p><p className="font-bold text-gold-500">${coinInfo.price}</p></div>
              <div><p className="text-xs text-gray-400">Supply</p><p className="font-bold">{coinInfo.totalSupply?.toLocaleString()}</p></div>
              <div><p className="text-xs text-gray-400">Sold</p><p className="font-bold">{coinInfo.totalSold?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
              <div><p className="text-xs text-gray-400">Remaining</p><p className="font-bold">{coinInfo.remaining?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p></div>
              <div><p className="text-xs text-gray-400">Launch</p><p className="font-bold text-gold-500">Oct 1, 2026</p></div>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2.5 overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(parseFloat(coinInfo.percentSold) || 0, 100)}%` }}
                transition={{ duration: 1.5, ease: 'easeOut', delay: 0.5 }}
                className="h-2.5 rounded-full" style={{background:'linear-gradient(90deg,#D4AF37,#FFD700)'}} />
            </div>
            <p className="text-sm text-gray-400 mt-2 text-right">{coinInfo.percentSold}% sold</p>
          </motion.div>
        )}

        {/* Market Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="mb-6 md:mb-8">
          <MarketChart />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            {/* Quick Actions */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { href: '/preorder', label: 'Preorder GPG', gold: true, icon: '🪙' },
                  { href: '/trade', label: 'Trade P2P', gold: false, icon: '📊' },
                  { href: '/wallet', label: 'Fund Wallet', gold: false, icon: '💰' },
                  { href: '/referrals', label: 'Refer & Earn', gold: false, icon: '🎁' },
                  { href: '/kyc', label: 'KYC Verify', gold: false, icon: '🛡️' },
                ].map((action) => (
                  <motion.div key={action.href} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                    <Link href={action.href}
                      className={`flex flex-col items-center gap-2 py-4 rounded-xl font-semibold transition-all text-center text-xs md:text-sm ${
                        action.gold
                          ? 'bg-gold-500 text-black hover:bg-gold-400 shadow-lg shadow-gold-500/20'
                          : 'border border-zinc-700/60 hover:bg-zinc-800/80 hover:border-zinc-600'
                      }`}>
                      <span className="text-lg">{action.icon}</span>
                      {action.label}
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Real-time Crypto Prices */}
            <CryptoPrices />
          </div>

          {/* Right sidebar */}
          <div className="space-y-4 md:space-y-6">
            {/* Referral Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-gold-500/10 to-zinc-900 border border-gold-500/30 rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold mb-3">Referral Program</h3>
              {tierInfo?.currentTier && (
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm">{tierInfo.currentTier.icon}</span>
                  <span className="text-xs md:text-sm font-semibold" style={{ color: tierInfo.currentTier.color }}>{tierInfo.currentTier.name} Tier</span>
                </div>
              )}
              <p className="text-xs md:text-sm text-gray-400 mb-3">Earn <span className="text-gold-500 font-bold">{referral?.rewardPerReferral || 0.0001} GPG</span> per referral</p>
              <button onClick={copyReferral}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2.5 px-3 text-[10px] md:text-xs font-mono text-gray-300 hover:border-gold-500/50 mb-3 text-left truncate">
                {copied ? '✓ Copied to clipboard!' : referral?.referralCode || '...'}
              </button>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={copyReferral}
                className="w-full bg-gold-500 text-black py-2.5 rounded-lg font-semibold hover:bg-gold-400 transition-colors text-sm">
                {copied ? 'Copied!' : 'Copy Referral Link'}
              </motion.button>
              <Link href="/referrals" className="block text-center text-sm text-gold-500 mt-3 hover:underline">View Leaderboard &rarr;</Link>
            </motion.div>

            {/* Recent Activity */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base md:text-lg font-semibold">Recent Activity</h3>
                <Link href="/wallet" className="text-xs text-gold-500 hover:underline">View All</Link>
              </div>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-3xl mb-2">📭</div>
                  <p className="text-gray-400 text-sm">No activity yet</p>
                  <Link href="/preorder" className="text-gold-500 text-xs hover:underline mt-1 inline-block">Start investing &rarr;</Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 8).map((tx: any, i: number) => {
                    const isPos = tx.type === 'deposit' || tx.type === 'sell' || tx.type === 'referral_reward';
                    const icon = TX_ICONS[tx.type] || '📋';
                    return (
                      <motion.div key={tx.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + i * 0.04 }}
                        className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                        <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-sm shrink-0">{icon}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium capitalize truncate">{tx.type.replace(/_/g, ' ')}</p>
                          <p className="text-[11px] text-gray-500">{tx.currency} • {new Date(tx.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className={`text-sm font-mono font-semibold ${isPos ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isPos ? '+' : '-'}{tx.currency === 'GPG' ? parseFloat(tx.amount).toFixed(4) : '$' + parseFloat(tx.usd_value || tx.amount).toFixed(2)}
                          </p>
                          <p className={`text-[10px] ${tx.status === 'completed' ? 'text-emerald-500' : tx.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>{tx.status}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <ChatBot />
    </main>
  );
}
