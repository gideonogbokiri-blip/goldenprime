'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { walletAPI } from '@/lib/api';

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

export default function WalletCard() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [walletsRes, txRes] = await Promise.all([
        walletAPI.getWallets(),
        walletAPI.getTransactions(10),
      ]);
      setWallets(walletsRes.data.wallets);
      setTransactions(txRes.data.transactions);
    } catch (err) {
      console.error('Failed to fetch wallet data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Loading wallet...</div>;

  const usdWallet = wallets.find((w) => w.currency === 'USD');
  const usdBalance = usdWallet ? parseFloat(usdWallet.balance) : 0;

  return (
    <div className="space-y-6">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">USD Balance</h3>
        <p className="text-4xl font-bold text-gold-500 mb-4">
          ${usdBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
        <div className="flex gap-3">
          <Link href="/deposit" className="bg-gold-500 text-black px-6 py-2 rounded-lg font-semibold hover:bg-gold-400 transition-colors text-center">
            Deposit
          </Link>
        </div>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p className="text-gray-400">No transactions yet</p>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => {
              const isDeposit = tx.type === 'deposit';
              const isSell = tx.type === 'sell';
              const isPositive = isDeposit || isSell;
              return (
                <div key={tx.id} className="flex justify-between items-center py-3 border-b border-zinc-800/50">
                  <div>
                    <div className="font-semibold capitalize">{tx.type}</div>
                    <div className="text-sm text-gray-400">{tx.currency} &middot; {new Date(tx.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="text-right">
                    <div className={`font-mono ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                      {isPositive ? '+' : '-'}${parseFloat(tx.usd_value || tx.amount).toFixed(2)}
                    </div>
                    <div className={`text-xs ${tx.status === 'completed' ? 'text-green-500' : tx.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                      {tx.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
