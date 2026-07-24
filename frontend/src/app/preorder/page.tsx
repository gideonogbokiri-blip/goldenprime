'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { goldAPI } from '@/lib/api';
import SuccessAnimation from '@/components/ui/SuccessAnimation';
import { fireGoldConfetti, fireBigCelebration } from '@/lib/confetti';
import { SkeletonTable } from '@/components/ui/Skeleton';
import BrandLogo from '@/components/ui/BrandLogo';

type Step = 'amount' | 'payment' | 'confirm' | 'done';
type PayMethod = 'bank_transfer' | 'card';

export default function PreorderPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('amount');
  const [amount, setAmount] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('bank_transfer');
  const [coinInfo, setCoinInfo] = useState<any>(null);
  const [preorders, setPreorders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardLast4, setCardLast4] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    Promise.all([
      goldAPI.getCoinInfo().then(r => setCoinInfo(r.data)),
      goldAPI.getMyPreorders(10).then(r => setPreorders(r.data.deposits || [])),
    ]).catch(() => {}).finally(() => setInitialLoading(false));
  }, [router]);

  const gpgAmount = amount && coinInfo ? (parseFloat(amount) / coinInfo.price).toFixed(4) : '0';

  const handleSubmit = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 50) {
      setMessage({ type: 'error', text: 'Minimum preorder is $50 (1 GPG coin)' });
      return;
    }
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const data: any = { amount: amt, paymentMethod: payMethod };
      if (payMethod === 'bank_transfer') {
        data.bankName = bankName;
        data.accountNumber = accountNumber;
        data.accountName = accountName;
      } else {
        data.cardHolder = cardHolder;
        data.cardLast4 = cardLast4;
        data.bankName = bankName;
        data.expiryMonth = expiryMonth;
        data.expiryYear = expiryYear;
      }
      await goldAPI.preorder(data);
      setStep('done');
      fireBigCelebration();
      goldAPI.getMyPreorders(10).then(r => setPreorders(r.data.deposits || [])).catch(() => {});
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Preorder failed' });
    } finally {
      setLoading(false);
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30',
    completed: 'text-green-500 bg-green-500/10 border-green-500/30',
    rejected: 'text-red-500 bg-red-500/10 border-red-500/30',
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 backdrop-blur-xl bg-zinc-950/80 px-4 md:px-6 py-4 flex justify-between items-center">
        <BrandLogo size={32} href="/dashboard" />
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Back to Dashboard</Link>
      </nav>
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-semibold mb-2"
        >
          Preorder GPG
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mb-6 md:mb-8 text-sm md:text-base"
        >
          Buy GoldenPrime Gold Coin at ${coinInfo?.price || 50}/coin
        </motion.p>

        {/* Steps */}
        <div className="flex items-center gap-2 md:gap-4 mb-6 md:mb-8 overflow-x-auto">
          {(['amount', 'payment', 'done'] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <motion.div
                animate={step === s ? { scale: [1, 1.2, 1] } : {}}
                transition={{ duration: 0.3 }}
                className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm font-bold ${
                  step === s ? 'bg-gold-500 text-black' :
                  (['amount', 'payment', 'done'].indexOf(step) > i ? 'bg-gold-500/30 text-gold-500' : 'bg-zinc-800 text-gray-500')
                }`}
              >
                {i + 1}
              </motion.div>
              <span className={`text-xs md:text-sm ${step === s ? 'text-white' : 'text-gray-500'}`}>
                {s === 'amount' ? 'Amount' : s === 'payment' ? 'Payment' : 'Done'}
              </span>
              {i < 2 && <div className="w-6 md:w-8 h-px bg-zinc-700" />}
            </div>
          ))}
        </div>

        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-3 rounded-lg mb-6 text-sm ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}
          >
            {message.text}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
                <label className="text-xs md:text-sm text-gray-400 mb-2 block">Amount (USD)</label>
                <div className="relative mb-4">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl md:text-2xl">$</span>
                  <input type="number" min="50" step="50" placeholder="50" value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 md:pl-12 pr-4 py-3 md:py-4 bg-zinc-800 border border-zinc-700 rounded-lg text-xl md:text-2xl font-mono focus:outline-none focus:border-gold-500 transition-colors" />
                </div>
                {amount && parseFloat(amount) > 0 && coinInfo && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gold-500/10 border border-gold-500/30 rounded-lg p-3 mb-4"
                  >
                    <p className="text-gold-500 font-semibold text-sm">You will receive: {gpgAmount} GPG</p>
                    <p className="text-xs text-gray-400">@ ${coinInfo.price} per GoldenPrime Gold Coin</p>
                  </motion.div>
                )}
                <div className="grid grid-cols-4 gap-2 mb-4 md:mb-6">
                  {[50, 100, 500, 1000].map((v) => (
                    <motion.button
                      key={v}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setAmount(v.toString())}
                      className={`py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${amount === v.toString() ? 'bg-gold-500 text-black' : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'}`}
                    >
                      ${v.toLocaleString()}
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => { if (parseFloat(amount) >= 50) setStep('payment'); else setMessage({ type: 'error', text: 'Minimum is $50' }); }}
                  disabled={!amount || parseFloat(amount) < 50}
                  className="w-full bg-gold-500 text-black py-3 md:py-4 rounded-lg font-semibold text-base md:text-lg hover:bg-gold-400 transition-colors disabled:opacity-50"
                >
                  Continue to Payment
                </motion.button>
              </div>
            </motion.div>
          )}

          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4 md:space-y-6"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold mb-4">Payment Method</h3>
                <div className="grid grid-cols-2 gap-3 mb-4 md:mb-6">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setPayMethod('bank_transfer')}
                    className={`p-3 md:p-4 rounded-xl border-2 text-left transition-all ${payMethod === 'bank_transfer' ? 'border-gold-500 bg-gold-500/5' : 'border-zinc-700 hover:border-zinc-500'}`}
                  >
                    <div className="font-semibold text-sm">Bank Transfer</div>
                    <div className="text-xs text-gray-400">Send from your bank</div>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setPayMethod('card')}
                    className={`p-3 md:p-4 rounded-xl border-2 text-left transition-all ${payMethod === 'card' ? 'border-gold-500 bg-gold-500/5' : 'border-zinc-700 hover:border-zinc-500'}`}
                  >
                    <div className="font-semibold text-sm">Debit/Credit Card</div>
                    <div className="text-xs text-gray-400">Pay with your card</div>
                  </motion.button>
                </div>

                <AnimatePresence mode="wait">
                  {payMethod === 'bank_transfer' && (
                    <motion.div
                      key="bank"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 md:space-y-4"
                    >
                      <p className="text-xs md:text-sm text-gray-400 mb-2">Enter your bank details (saved for future recovery)</p>
                      <input type="text" placeholder="Bank Name" value={bankName} onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      <input type="text" placeholder="Account Number" value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      <input type="text" placeholder="Account Name" value={accountName} onChange={(e) => setAccountName(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                    </motion.div>
                  )}

                  {payMethod === 'card' && (
                    <motion.div
                      key="card"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3 md:space-y-4"
                    >
                      <p className="text-xs md:text-sm text-gray-400 mb-2">Enter your card details (saved for future recovery)</p>
                      <input type="text" placeholder="Cardholder Name" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      <input type="text" placeholder="Last 4 digits of card" maxLength={4} value={cardLast4} onChange={(e) => setCardLast4(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      <input type="text" placeholder="Bank Name (optional)" value={bankName} onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      <div className="grid grid-cols-2 gap-3 md:gap-4">
                        <input type="text" placeholder="MM" maxLength={2} value={expiryMonth} onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                        <input type="text" placeholder="YY" maxLength={2} value={expiryYear} onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, ''))}
                          className="w-full px-3 md:px-4 py-2.5 md:py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:border-gold-500 transition-colors text-sm" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Amount</span><span className="font-bold">${parseFloat(amount).toLocaleString()}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">GPG Coins</span><span className="font-bold text-gold-500">{gpgAmount} GPG</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Price per coin</span><span>${coinInfo?.price || 50}</span></div>
                  <div className="flex justify-between text-sm"><span className="text-gray-400">Payment</span><span className="capitalize">{payMethod.replace('_', ' ')}</span></div>
                </div>
                <div className="flex gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit} disabled={loading}
                    className="flex-1 bg-gold-500 text-black py-3 rounded-lg font-semibold hover:bg-gold-400 transition-colors disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Processing...' : 'Place Preorder'}
                  </motion.button>
                  <button onClick={() => setStep('amount')} className="px-4 md:px-6 py-3 border border-zinc-700 rounded-lg font-semibold hover:bg-zinc-800 text-sm">Back</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'done' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 md:p-8 text-center"
            >
              <SuccessAnimation
                title="Preorder Submitted!"
                subtitle={`Your preorder of ${gpgAmount} GPG ($${parseFloat(amount).toLocaleString()}) is pending review. An admin will verify your payment and credit your GPG balance shortly.`}
              />
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
                <Link href="/dashboard" className="bg-gold-500 text-black px-6 md:px-8 py-3 rounded-lg font-semibold hover:bg-gold-400 text-center">Dashboard</Link>
                <button onClick={() => { setStep('amount'); setAmount(''); }} className="px-6 md:px-8 py-3 border border-zinc-700 rounded-lg font-semibold hover:bg-zinc-800">New Preorder</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Preorder History */}
        {initialLoading ? (
          <div className="mt-8 md:mt-10"><SkeletonTable rows={3} /></div>
        ) : preorders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 md:mt-10 bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6"
          >
            <h3 className="text-lg md:text-xl font-semibold mb-4">Your Preorders</h3>
            <div className="space-y-3">
              {preorders.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 border-b border-zinc-800/50 last:border-0 gap-2"
                >
                  <div>
                    <div className="font-semibold text-sm">{p.amount} GPG</div>
                    <div className="text-xs text-gray-400">${parseFloat(p.usd_value || p.amount).toFixed(2)} &middot; {p.metadata?.paymentMethod === 'card' ? 'Card' : 'Bank Transfer'}</div>
                    <div className="text-[10px] text-gray-500">{new Date(p.created_at).toLocaleString()}</div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] md:text-xs font-semibold border self-start sm:self-auto ${statusColors[p.status] || 'text-gray-400'}`}>
                    {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
