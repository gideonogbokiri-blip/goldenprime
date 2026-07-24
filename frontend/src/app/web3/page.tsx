'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useWeb3 } from '@/lib/web3';
import { authAPI } from '@/lib/api';

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
      <nav className="border-b border-zinc-800 px-4 md:px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-xl md:text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</Link>
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
            <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500/10 rounded-xl flex items-center justify-center text-2xl md:text-3xl">
              🐵
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
              { name: 'MetaMask', icon: '🦊', available: true },
              { name: 'WalletConnect', icon: '🔌', available: false },
              { name: 'Coinbase', icon: '💰', available: false },
              { name: 'Trust Wallet', icon: '🔒', available: false },
            ].map((w) => (
              <div key={w.name} className={`p-4 rounded-xl border text-center ${w.available ? 'border-zinc-700 bg-zinc-800/50' : 'border-zinc-800 opacity-50'}`}>
                <div className="text-2xl mb-2">{w.icon}</div>
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
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Seamless on-chain GPG token transfers when the token launches.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Direct crypto-to-GPG swaps without fiat intermediaries.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> Verifiable on-chain transactions and proof of holdings.</li>
            <li className="flex items-start gap-2"><span className="text-gold-500 mt-0.5">&#10003;</span> DeFi integrations and staking rewards in future updates.</li>
          </ul>
        </motion.div>
      </div>
    </main>
  );
}
