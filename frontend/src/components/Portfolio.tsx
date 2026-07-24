'use client';

import { useEffect, useState } from 'react';
import { tradingAPI } from '@/lib/api';

interface Holding {
  currency: string;
  balance: number;
  currentPrice: number;
  value: number;
  change24h: number;
  name: string;
}

export default function Portfolio() {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [totalValue, setTotalValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPortfolio(); }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await tradingAPI.getPortfolio();
      setHoldings(res.data.holdings);
      setTotalValue(res.data.totalValue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8 text-gray-400">Loading portfolio...</div>;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Portfolio</h3>
        <button onClick={fetchPortfolio} className="text-sm text-gold-500 hover:underline">Refresh</button>
      </div>
      <div className="mb-6">
        <p className="text-gray-400 text-sm">Total Value</p>
        <p className="text-4xl font-bold text-gold-500">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
      </div>
      {holdings.length === 0 ? (
        <p className="text-gray-400">No holdings yet. Start trading!</p>
      ) : (
        <div className="space-y-3">
          {holdings.map((h) => (
            <div key={h.currency} className="flex justify-between items-center py-3 border-b border-zinc-800/50">
              <div>
                <div className="font-semibold">{h.currency}</div>
                <div className="text-sm text-gray-400">{h.name}</div>
              </div>
              <div className="text-right">
                <div className="font-mono">{h.balance.toLocaleString(undefined, { maximumFractionDigits: 8 })} {h.currency}</div>
                <div className="text-sm text-gray-400">${h.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
