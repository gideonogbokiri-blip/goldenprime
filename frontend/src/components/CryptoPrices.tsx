'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CryptoIcon from '@/components/CryptoIcon';

interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

export default function CryptoPrices() {
  const [prices, setPrices] = useState<CoinPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [prevPrices, setPrevPrices] = useState<Record<string, number>>({});

  const fetchPrices = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://goldenprime-api.vercel.app/api'}/crypto/prices`);
      const data = await res.json();
      const newPrices = data.prices || [];

      const prevMap: Record<string, number> = {};
      prices.forEach(p => { prevMap[p.id] = p.price; });
      setPrevPrices(prevMap);

      setPrices(newPrices);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="skeleton h-5 w-32 rounded" />
          <div className="skeleton h-3 w-24 rounded" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 py-3 border-b border-zinc-800/50">
              <div className="skeleton h-4 w-16 rounded" />
              <div className="skeleton h-4 w-24 rounded" />
              <div className="skeleton h-4 w-16 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (prices.length === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg md:text-xl font-semibold">Market Prices</h3>
        <span className="text-[10px] md:text-xs text-gray-500">Updates every 30s</span>
      </div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-400 text-xs border-b border-zinc-800">
              <th className="pb-3">Coin</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">24h Change</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {prices.slice(0, 8).map((coin, i) => {
                const priceChanged = prevPrices[coin.id] && prevPrices[coin.id] !== coin.price;
                const priceUp = prevPrices[coin.id] && coin.price > prevPrices[coin.id];

                return (
                  <motion.tr
                    key={coin.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <CryptoIcon symbol={coin.symbol} size={20} />
                        <span className="font-semibold">{coin.symbol.toUpperCase()}</span>
                        <span className="text-gray-400 ml-1">{coin.name}</span>
                      </div>
                    </td>
                    <td className="py-3 font-mono">
                      <motion.span
                        key={`${coin.id}-${coin.price}`}
                        initial={priceChanged ? { color: priceUp ? '#22c55e' : '#ef4444' } : {}}
                        animate={{ color: '#ffffff' }}
                        transition={{ duration: 1.5 }}
                      >
                        ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </motion.span>
                    </td>
                    <td className="py-3">
                      <span className={`font-mono ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        <AnimatePresence>
          {prices.slice(0, 8).map((coin, i) => {
            const priceChanged = prevPrices[coin.id] && prevPrices[coin.id] !== coin.price;
            const priceUp = prevPrices[coin.id] && coin.price > prevPrices[coin.id];

            return (
              <motion.div
                key={coin.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between py-3 border-b border-zinc-800/50 last:border-0"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CryptoIcon symbol={coin.symbol} size={24} />
                  <div className="min-w-0">
                    <span className="font-semibold text-sm">{coin.symbol.toUpperCase()}</span>
                    <span className="text-gray-400 text-xs ml-1.5 truncate">{coin.name}</span>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <motion.div
                    key={`${coin.id}-${coin.price}`}
                    initial={priceChanged ? { color: priceUp ? '#22c55e' : '#ef4444' } : {}}
                    animate={{ color: '#ffffff' }}
                    transition={{ duration: 1.5 }}
                    className="font-mono font-semibold text-sm"
                  >
                    ${coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </motion.div>
                  <span className={`font-mono text-[10px] ${coin.change24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {coin.change24h >= 0 ? '+' : ''}{coin.change24h.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
