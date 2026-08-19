'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWeb3 } from '@/lib/web3';
import { authAPI } from '@/lib/api';
import BrandLogo from '@/components/ui/BrandLogo';

export default function Web3Page() {
  const router = useRouter();
  const { wallet, isInstalled, isConnecting, connect, disconnect, getChainName } = useWeb3();
  const [user, setUser] = useState<any>(null);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    authAPI.getMe().then(r => setUser(r.data.user)).catch(() => {});
  }, [router]);

  useEffect(() => {
    if (wallet.connected && wallet.address) {
      setSavedAddress(wallet.address);
    }
  }, [wallet]);

  const handleConnect = async () => {
    try {
      const address = await connect();
      setMessage({ type: 'success', text: `Connected: ${address?.slice(0, 6)}...${address?.slice(-4)}` });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Failed to connect' });
    }
  };

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="sticky top-0 z-50 border-b border-zinc-800/60 backdrop-blur-xl bg-zinc-950/80 px-4 md:px-6 py-4 flex justify-between items-center">
        <BrandLogo size={32} href="/dashboard" />
        <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Back to Dashboard</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl md:text-3xl font-semibold mb-2">
          Web3 Wallet
        </motion.h2>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="text-gray-400 mb-8">
          Connect your crypto wallet for on-chain transactions
        </motion.p>

        {message.text && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className={`px-4 py-3 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/50 text-green-400' : 'bg-red-500/10 border border-red-500/50 text-red-400'}`}>
            {message.text}
          </motion.div>
        )}

        {/* MetaMask Connection */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center gap-3 md:gap-4 mb-6">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500/10 rounded-xl flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold">MetaMask</h3>
              <p className="text-sm text-gray-400">Connect with MetaMask browser extension</p>
            </div>
          </div>

          {!isInstalled ? (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-500 text-sm font-medium mb-2">MetaMask is not installed</p>
              <p className="text-xs text-gray-400 mb-3">Install MetaMask to connect your wallet.</p>
              <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer"
                className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-400 transition-colors inline-block">
                Install MetaMask
              </a>
            </div>
          ) : wallet.connected ? (
            <div className="space-y-4">
              <div className="bg-zinc-800/50 border border-green-500/30 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-green-500 text-sm font-semibold">Connected</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Address</span>
                    <span className="font-mono text-xs">{wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Network</span>
                    <span>{getChainName(wallet.chainId)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">ETH Balance</span>
                    <span className="font-mono">{wallet.balance} ETH</span>
                  </div>
                </div>
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={disconnect}
                className="bg-red-500/20 text-red-500 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-red-500/30 transition-colors">
                Disconnect
              </motion.button>
            </div>
          ) : (
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleConnect} disabled={isConnecting}
              className="w-full bg-orange-500 text-white py-3 rounded-lg font-semibold hover:bg-orange-400 transition-colors disabled:opacity-50">
              {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
            </motion.button>
          )}
        </motion.div>

        {/* Supported Wallets */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Supported Wallets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { name: 'MetaMask', color: '#F97316', available: true },
              { name: 'WalletConnect', color: '#3B99FC', available: false },
              { name: 'Coinbase', color: '#0052FF', available: false },
              { name: 'Trust Wallet', color: '#3375FF', available: false },
            ].map((w) => (
              <div key={w.name} className={`p-4 rounded-xl border text-center ${w.available ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-800 opacity-50'}`}>
                <div className="w-10 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ background: `${w.color}15` }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={w.color} strokeWidth="1.5"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <p className="text-sm font-semibold">{w.name}</p>
                {!w.available && <p className="text-xs text-gray-500 mt-1">Coming soon</p>}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Benefits */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Why Connect a Wallet?</h3>
          <ul className="space-y-3 text-sm text-gray-400">
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Seamless on-chain token transfers for supported digital assets.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Direct crypto deposits and withdrawals without fiat intermediaries.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Verifiable on-chain transactions and proof of holdings.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> DeFi integrations and staking rewards in future updates.</li>
          </ul>
        </motion.div>
      </div>
    </main>
  );
}
