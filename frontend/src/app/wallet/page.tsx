'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { walletAPI, goldAPI } from '@/lib/api';
import { SkeletonCard, SkeletonTable } from '@/components/ui/Skeleton';
import { StaggerContainer, StaggerItem } from '@/components/ui/Animations';
import CoinFlip from '@/components/ui/CoinFlip';

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

export default function WalletPage() {
  const router = useRouter();
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFund, setShowFund] = useState(false);
  const [fundMethod, setFundMethod] = useState<'bank_transfer' | 'card'>('bank_transfer');
  const [fundAmount, setFundAmount] = useState('');
  const [fundBankName, setFundBankName] = useState('');
  const [fundAccountNumber, setFundAccountNumber] = useState('');
  const [fundAccountName, setFundAccountName] = useState('');
  const [fundCardHolder, setFundCardHolder] = useState('');
  const [fundCardLast4, setFundCardLast4] = useState('');
  const [fundExpiryMonth, setFundExpiryMonth] = useState('');
  const [fundExpiryYear, setFundExpiryYear] = useState('');
  const [funding, setFunding] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    fetchData();
  }, [router]);

  const fetchData = async () => {
    try {
      const [walletsRes, txRes] = await Promise.all([
        walletAPI.getWallets(),
        walletAPI.getTransactions(20),
      ]);
      setWallets(walletsRes.data.wallets);
      setTransactions(txRes.data.transactions);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleFund = async () => {
    const amt = parseFloat(fundAmount);
    if (!amt || amt < 10) { setMessage({ type: 'error', text: 'Minimum is $10' }); return; }
    setFunding(true);
    setMessage({ type: '', text: '' });
    try {
      await goldAPI.preorder({
        amount: amt,
        paymentMethod: fundMethod,
        bankName: fundMethod === 'bank_transfer' ? fundBankName : undefined,
        accountNumber: fundMethod === 'bank_transfer' ? fundAccountNumber : undefined,
        accountName: fundMethod === 'bank_transfer' ? fundAccountName : undefined,
        cardHolder: fundMethod === 'card' ? fundCardHolder : undefined,
        cardLast4: fundMethod === 'card' ? fundCardLast4 : undefined,
        expiryMonth: fundMethod === 'card' ? fundExpiryMonth : undefined,
        expiryYear: fundMethod === 'card' ? fundExpiryYear : undefined,
      });
      setMessage({ type: 'success', text: 'Fund request submitted! An admin will verify shortly.' });
      setShowFund(false);
      setFundAmount('');
      fetchData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Fund request failed' });
    } finally { setFunding(false); }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950">
        <nav className="border-b border-zinc-800 px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="text-xl md:text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</div>
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
  const gpgWallet = wallets.find(w => w.currency === 'GPG');
  const usdBalance = usdWallet ? parseFloat(usdWallet.balance) : 0;
  const gpgBalance = gpgWallet ? parseFloat(gpgWallet.balance) : 0;

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 px-4 md:px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl md:text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</Link>
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Back to Dashboard</Link>
      </nav>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold mb-6 md:mb-8"
        >
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
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8" stagger={0.1}>
          <StaggerItem>
            <CoinFlip balance={gpgBalance} />
          </StaggerItem>
          <StaggerItem>
            <motion.div
              whileHover={{ y: -4 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6"
            >
              <p className="text-gray-400 text-xs md:text-sm mb-1">USD Balance</p>
              <p className="text-2xl md:text-4xl font-bold">${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              <p className="text-xs md:text-sm text-gray-400">Available for preorder</p>
            </motion.div>
          </StaggerItem>
          <StaggerItem className="flex items-center justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFund(true)}
              className="bg-gold-500 text-black px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors text-base md:text-lg w-full sm:w-auto"
            >
              Fund Wallet
            </motion.button>
          </StaggerItem>
        </StaggerContainer>

        {/* Fund Modal */}
        <AnimatePresence>
          {showFund && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-6 md:mb-8"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
                <h3 className="text-lg md:text-xl font-semibold mb-4">Fund Your Wallet</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => setFundMethod('bank_transfer')} className={`p-3 md:p-4 rounded-xl border-2 text-left ${fundMethod === 'bank_transfer' ? 'border-gold-500 bg-gold-500/5' : 'border-zinc-700'}`}>
                    <div className="font-semibold text-sm">Bank Transfer</div>
                    <div className="text-xs text-gray-400">Send from bank</div>
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} onClick={() => setFundMethod('card')} className={`p-3 md:p-4 rounded-xl border-2 text-left ${fundMethod === 'card' ? 'border-gold-500 bg-gold-500/5' : 'border-zinc-700'}`}>
                    <div className="font-semibold text-sm">Debit/Credit Card</div>
                    <div className="text-xs text-gray-400">Pay with card</div>
                  </motion.button>
                </div>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">$</span>
                  <input type="number" min="10" step="10" placeholder="100" value={fundAmount} onChange={(e) => setFundAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-xl font-mono focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {[50, 100, 500, 1000].map(v => (
                    <motion.button key={v} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFundAmount(v.toString())} className={`py-2 rounded-lg text-xs md:text-sm font-semibold ${fundAmount === v.toString() ? 'bg-gold-500 text-black' : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'}`}>${v}</motion.button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {fundMethod === 'bank_transfer' && (
                    <motion.div key="bank" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 mb-4">
                      <p className="text-xs md:text-sm text-gray-400">Your bank details (saved for recovery)</p>
                      <input type="text" placeholder="Bank Name" value={fundBankName} onChange={e => setFundBankName(e.target.value)} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      <input type="text" placeholder="Account Number" value={fundAccountNumber} onChange={e => setFundAccountNumber(e.target.value)} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      <input type="text" placeholder="Account Name" value={fundAccountName} onChange={e => setFundAccountName(e.target.value)} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                    </motion.div>
                  )}
                  {fundMethod === 'card' && (
                    <motion.div key="card" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3 mb-4">
                      <p className="text-xs md:text-sm text-gray-400">Your card details (saved for recovery)</p>
                      <input type="text" placeholder="Cardholder Name" value={fundCardHolder} onChange={e => setFundCardHolder(e.target.value)} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      <input type="text" placeholder="Last 4 digits" maxLength={4} value={fundCardLast4} onChange={e => setFundCardLast4(e.target.value.replace(/\D/g, ''))} className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      <div className="grid grid-cols-2 gap-3">
                        <input type="text" placeholder="MM" maxLength={2} value={fundExpiryMonth} onChange={e => setFundExpiryMonth(e.target.value.replace(/\D/g, ''))} className="px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                        <input type="text" placeholder="YY" maxLength={2} value={fundExpiryYear} onChange={e => setFundExpiryYear(e.target.value.replace(/\D/g, ''))} className="px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleFund} disabled={funding || !fundAmount || parseFloat(fundAmount) < 10}
                    className="flex-1 bg-gold-500 text-black py-3 rounded-lg font-semibold hover:bg-gold-400 disabled:opacity-50 text-sm">
                    {funding ? 'Processing...' : 'Submit Fund Request'}
                  </motion.button>
                  <button onClick={() => setShowFund(false)} className="px-4 md:px-6 py-3 border border-zinc-700 rounded-lg font-semibold hover:bg-zinc-800 text-sm">Cancel</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6"
        >
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
                        {tx.currency} {meta.paymentMethod ? `(${meta.paymentMethod === 'card' ? 'Card' : 'Bank Transfer'})` : ''}
                        {meta.gpgAmount ? ` - ${meta.gpgAmount} GPG` : ''}
                      </div>
                      <div className="text-[10px] text-gray-500">{new Date(tx.created_at).toLocaleString()}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className={`font-mono text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? '+' : '-'}{tx.currency === 'GPG' ? parseFloat(tx.amount).toFixed(4) + ' GPG' : '$' + parseFloat(tx.usd_value || tx.amount).toFixed(2)}
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
