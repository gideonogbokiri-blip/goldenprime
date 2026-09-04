'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { walletAPI, depositAPI, settingsAPI, tradingAPI } from '@/lib/api';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { StaggerContainer, StaggerItem } from '@/components/ui/Animations';
import BrandLogo from '@/components/ui/BrandLogo';

interface Wallet {
  id: string;
  currency: string;
  balance: string;
}

interface Transaction {
  id: string;
  type: string;
  currency: string;
  amount: string;
  usd_value: string | null;
  status: string;
  metadata?: any;
  created_at: string;
}

function compressImage(file: File, maxSize = 1000, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = reader.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function WalletPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [cryptoHoldings, setCryptoHoldings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'fund' | 'withdraw'>('fund');

  const [fundCoin, setFundCoin] = useState<'btc' | 'eth' | 'usdt'>('btc');
  const [fundAmount, setFundAmount] = useState('');
  const [referenceCode, setReferenceCode] = useState('');
  const [slip, setSlip] = useState<string | null>(null);
  const [slipName, setSlipName] = useState('');
  const [funding, setFunding] = useState(false);

  const [wdAmount, setWdAmount] = useState('');
  const [wdBankName, setWdBankName] = useState('');
  const [wdAccountNumber, setWdAccountNumber] = useState('');
  const [wdAccountName, setWdAccountName] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });
  const slipRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [walletsRes, txRes, settingsRes, holdingsRes] = await Promise.all([
        walletAPI.getWallets(),
        walletAPI.getTransactions(20),
        settingsAPI.getPublic(),
        tradingAPI.getPortfolio().catch(() => ({ data: { holdings: [] } })),
      ]);
      setWallets(walletsRes.data.wallets);
      setTransactions(txRes.data.transactions);
      setSettings(settingsRes.data);
      setCryptoHoldings(holdingsRes.data.holdings || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSlip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setMessage({ type: 'error', text: 'Please attach an image (payment slip).' }); return; }
    try {
      setSlip(await compressImage(file));
      setSlipName(file.name);
      setMessage({ type: '', text: '' });
    } catch {
      setMessage({ type: 'error', text: 'Could not read that image.' });
    }
    e.target.value = '';
  };

  const handleFund = async () => {
    const amt = parseFloat(fundAmount);
    const min = settings.minDeposit || 500;
    if (!amt || amt < min) { setMessage({ type: 'error', text: `Minimum deposit is $${min}` }); return; }
    setFunding(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await depositAPI.request({
        amount: amt,
        method: 'crypto',
        referenceCode: referenceCode || undefined,
        slip: slip || undefined,
      });
      setMessage({ type: 'success', text: 'Deposit request submitted! Admin will verify your payment and credit your wallet.' });
      setFundAmount(''); setReferenceCode(''); setSlip(null); setSlipName('');
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Deposit request failed' });
    } finally { setFunding(false); }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(wdAmount);
    if (!amt || amt <= 0) { setMessage({ type: 'error', text: 'Enter a valid amount' }); return; }
    if (!wdBankName || !wdAccountNumber || !wdAccountName) { setMessage({ type: 'error', text: 'Fill in all bank details' }); return; }
    setWithdrawing(true);
    setMessage({ type: '', text: '' });
    try {
      await walletAPI.withdraw({ amount: amt, bankName: wdBankName, accountNumber: wdAccountNumber, accountName: wdAccountName });
      setMessage({ type: 'success', text: 'Withdrawal requested. Funds are locked until admin approval.' });
      setWdAmount(''); setWdBankName(''); setWdAccountNumber(''); setWdAccountName('');
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Withdrawal request failed' });
    } finally { setWithdrawing(false); }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950">
        <nav className="border-b border-zinc-800 px-4 md:px-6 py-4 flex justify-between items-center">
          <BrandLogo size={32} />
          <div className="skeleton h-4 w-32 rounded" />
        </nav>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
          <div className="skeleton h-8 w-48 mb-6 md:mb-8 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <SkeletonTable rows={5} />
        </div>
      </main>
    );
  }

  const usdWallet = wallets.find(w => w.currency === 'USD');
  const usdBalance = usdWallet ? parseFloat(usdWallet.balance) : 0;
  const deposits = transactions.filter(t => t.type === 'deposit');
  const withdrawals = transactions.filter(t => t.type === 'withdrawal');

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 backdrop-blur-xl bg-zinc-950/80 px-4 md:px-6 py-4 flex justify-between items-center">
        <BrandLogo size={32} href="/dashboard" />
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Back to Dashboard</Link>
      </nav>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8">
          My Wallet
        </motion.h2>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-3 rounded-lg mb-6 text-sm ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}
          >
            {message.text}
          </motion.div>
        )}

        {/* Balances */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8" stagger={0.1}>
          <StaggerItem>
            <motion.div whileHover={{ y: -4 }} className="bg-gradient-to-br from-gold-500/[0.08] via-zinc-900 to-zinc-900 border border-gold-500/15 rounded-xl p-4 md:p-6">
              <p className="text-gray-400 text-xs md:text-sm mb-1">USD Balance</p>
              <p className="text-2xl md:text-4xl font-bold text-gold-400">${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-xs md:text-sm text-gray-400">Available for investing & withdrawal</p>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -4 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
              <p className="text-gray-400 text-xs md:text-sm mb-1">Total Deposit Requests</p>
              <p className="text-2xl md:text-4xl font-bold">{deposits.length}</p>
              <p className="text-xs md:text-sm text-gray-400">View status below</p>
            </motion.div>
          </StaggerItem>
          <StaggerItem>
            <motion.div whileHover={{ y: -4 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
              <p className="text-gray-400 text-xs md:text-sm mb-1">Pending Withdrawals</p>
              <p className="text-2xl md:text-4xl font-bold">{withdrawals.filter(w => w.status === 'pending').length}</p>
              <p className="text-xs md:text-sm text-gray-400">Awaiting admin approval</p>
            </motion.div>
          </StaggerItem>
        </StaggerContainer>

        {/* Action Tabs */}
        <div className="flex gap-2 mb-4">
          {(['fund', 'withdraw'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${tab === t ? 'bg-gold-500 text-black' : 'bg-zinc-900 border border-zinc-800 text-gray-400 hover:text-white'}`}>
              {t === 'fund' ? 'Fund Wallet' : 'Withdraw'}
            </button>
          ))}
        </div>

        {/* FUND */}
        <AnimatePresence mode="wait">
          {tab === 'fund' && (
            <motion.div key="fund" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6 md:mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-4">Fund Your Wallet</h3>

                <div className="grid grid-cols-3 gap-3 mb-4">
                  {(['btc', 'eth', 'usdt'] as const).map(c => (
                    <motion.button key={c} whileHover={{ scale: 1.02 }} onClick={() => setFundCoin(c)}
                      className={`p-3 md:p-4 rounded-xl border-2 text-left ${fundCoin === c ? 'border-gold-500 bg-gold-500/5' : 'border-zinc-700'}`}>
                      <div className="font-semibold text-sm">{c === 'btc' ? 'BTC' : c === 'eth' ? 'ETH' : 'USDT'}</div>
                      <div className="text-xs text-gray-400">{c === 'btc' ? 'Bitcoin' : c === 'eth' ? 'Ethereum' : settings.walletNetwork || 'USDT'}</div>
                    </motion.button>
                  ))}
                </div>

                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">$</span>
                  <input type="number" min={settings.minDeposit || 500} step="10" placeholder="1000" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xl font-mono focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[500, 1000, 5000, 10000].map(v => (
                    <motion.button key={v} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFundAmount(v.toString())} className={`py-2 rounded-lg text-xs md:text-sm font-semibold ${fundAmount === v.toString() ? 'bg-gold-500 text-black' : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'}`}>${v}</motion.button>
                  ))}
                </div>

                {(() => {
                  const coinLabel = fundCoin === 'btc' ? 'BTC' : fundCoin === 'eth' ? 'ETH' : 'USDT';
                  const addr = fundCoin === 'btc' ? settings.btcWallet : fundCoin === 'eth' ? settings.ethWallet : settings.usdtWallet;
                  if (!addr) return (
                    <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm">
                      <p className="text-yellow-400">Wallet address not set yet. Please check back shortly.</p>
                    </div>
                  );
                  return (
                    <div className="mb-4 p-4 bg-zinc-800/50 border border-zinc-700 rounded-lg text-sm">
                      <p className="text-gray-300 font-semibold mb-2">Send {coinLabel} to:</p>
                      <p className="text-gold-400 font-mono text-xs md:text-sm break-all bg-black/40 rounded-lg p-3 select-all">{addr}</p>
                      <p className="text-xs text-gray-400 mt-2">Network: <span className="text-white">{fundCoin === 'btc' ? 'Bitcoin (BTC)' : fundCoin === 'eth' ? 'Ethereum (ERC-20)' : settings.walletNetwork || 'Ethereum (ERC-20)'}</span></p>
                      <button onClick={() => { navigator.clipboard.writeText(addr); setMessage({ type: 'success', text: `${coinLabel} address copied to clipboard` }); }}
                        className="mt-3 text-xs bg-gold-500/10 border border-gold-500/40 text-gold-400 px-4 py-2 rounded-lg font-semibold hover:bg-gold-500/20 transition-colors">
                        Copy Address
                      </button>
                    </div>
                  );
                })()}

                <input type="text" placeholder="Reference code (optional — use your email)" value={referenceCode} onChange={(e) => setReferenceCode(e.target.value)}
                  className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm mb-3 focus:outline-none focus:border-gold-500 transition-colors" />

                {/* Slip upload */}
                <div className="mb-4">
                  <p className="text-xs text-gray-400 mb-2">Upload payment proof (transaction hash or screenshot) — required for confirmation</p>
                  <button onClick={() => slipRef.current?.click()} className="w-full border-2 border-dashed border-zinc-700 rounded-xl p-4 text-center hover:border-gold-500/50 transition-colors">
                    {slip ? (
                      <span className="flex items-center justify-center gap-2 text-sm text-emerald-400">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                        {slipName || 'Proof attached'}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2 text-sm text-zinc-500">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                        Click to upload payment proof
                      </span>
                    )}
                  </button>
                  {slip && <img src={slip} alt="Proof preview" className="mt-3 max-h-40 rounded-lg border border-zinc-700" />}
                  <input ref={slipRef} type="file" accept="image/*" onChange={handleSlip} className="hidden" />
                </div>

                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFund} disabled={funding || !fundAmount}
                    className="flex-1 bg-gold-500 text-black py-3 rounded-lg font-semibold hover:bg-gold-400 disabled:opacity-50 text-sm">
                    {funding ? 'Submitting...' : 'Submit Deposit Request'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* WITHDRAW */}
          {tab === 'withdraw' && (
            <motion.div key="withdraw" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6 md:mb-8">
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-1">Withdraw Funds</h3>
                <p className="text-xs text-gray-400 mb-4">Funds are locked on request and released after admin approval.</p>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">$</span>
                  <input type="number" min="1" placeholder="100" value={wdAmount} onChange={(e) => setWdAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xl font-mono focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <p className="text-xs text-gray-400 mb-2">Bank account to receive funds</p>
                <input type="text" placeholder="Bank Name" value={wdBankName} onChange={(e) => setWdBankName(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm mb-3 focus:outline-none focus:border-gold-500 transition-colors" />
                <input type="text" placeholder="Account Number" value={wdAccountNumber} onChange={(e) => setWdAccountNumber(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm mb-3 focus:outline-none focus:border-gold-500 transition-colors" />
                <input type="text" placeholder="Account Name" value={wdAccountName} onChange={(e) => setWdAccountName(e.target.value)} className="w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm mb-4 focus:outline-none focus:border-gold-500 transition-colors" />
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleWithdraw} disabled={withdrawing}
                  className="w-full bg-gold-500 text-black py-3 rounded-lg font-semibold hover:bg-gold-400 disabled:opacity-50 text-sm">
                  {withdrawing ? 'Requesting...' : 'Request Withdrawal'}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Withdrawal requests */}
        {withdrawals.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3">Withdrawal Requests</h3>
            <div className="space-y-2">
              {withdrawals.map(w => (
                <div key={w.id} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm">
                  <div>
                    <p className="font-semibold text-white">${parseFloat(w.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{w.metadata?.bankName} •••{String(w.metadata?.accountNumber || '').slice(-4)}</p>
                    <p className="text-[10px] text-gray-500">{new Date(w.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${w.status === 'completed' ? 'bg-green-500/20 text-green-500' : w.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {w.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Deposit requests */}
        {deposits.length > 0 && (
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3">Deposit Requests</h3>
            <div className="space-y-2">
              {deposits.map(d => (
                <div key={d.id} className="flex justify-between items-center bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-sm">
                  <div>
                    <p className="font-semibold text-white">${parseFloat(d.amount).toFixed(2)}</p>
                    <p className="text-xs text-gray-400">{d.metadata?.method === 'crypto' ? 'Crypto Transfer' : 'Crypto Transfer'}{d.metadata?.referenceCode ? ` • ${d.metadata.referenceCode}` : ''}</p>
                    <p className="text-[10px] text-gray-500">{new Date(d.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${d.status === 'completed' ? 'bg-green-500/20 text-green-500' : d.status === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                    {d.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Transaction History */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Transaction History</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx, i) => {
                const isPositive = tx.type === 'deposit' || tx.type === 'sell' || tx.type === 'referral_reward';
                const meta = tx.metadata || {};
                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.03 }}
                    className="flex justify-between items-center py-3 border-b border-zinc-800/50 last:border-0 gap-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-sm capitalize truncate">{tx.type.replace('_', ' ')}</div>
                      <div className="text-xs text-gray-400 truncate">
                        {tx.currency === 'USD' ? 'USD' : tx.currency} {meta.method === 'admin_manual' ? '(admin credit)' : meta.paymentMethod ? `(${meta.paymentMethod === 'card' ? 'Card' : 'Bank Transfer'})` : ''}
                      </div>
                      <div className="text-[10px] text-gray-500">{new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-mono text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}${parseFloat(tx.usd_value || tx.amount).toFixed(2)}
                      </div>
                      <div className={`text-[10px] md:text-xs ${tx.status === 'completed' ? 'text-green-500' : tx.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                        {tx.status}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  );
}