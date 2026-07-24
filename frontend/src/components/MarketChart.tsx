'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Timeframe = '1' | '5' | '15' | '60' | '240' | 'D';

const TIMEFRAMES: { label: string; value: Timeframe }[] = [
  { label: '1m', value: '1' },
  { label: '5m', value: '5' },
  { label: '15m', value: '15' },
  { label: '1H', value: '60' },
  { label: '4H', value: '240' },
  { label: '1D', value: 'D' },
];

interface MarketData {
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
}

export default function MarketChart() {
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('D');
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [chartKey, setChartKey] = useState(0);

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(fetchMarketData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchMarketData = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false',
        { headers: { 'User-Agent': 'GoldenPrime/1.0' } }
      );
      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMarketData({
        price: data.market_data.current_price.usd,
        change24h: data.market_data.price_change_percentage_24h,
        high24h: data.market_data.high_24h.usd,
        low24h: data.market_data.low_24h.usd,
        volume24h: data.market_data.total_volume.usd,
      });
      setError(false);
    } catch {
      if (!marketData) setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeframeChange = (tf: Timeframe) => {
    setActiveTimeframe(tf);
    setChartKey(prev => prev + 1);
  };

  const formatNumber = (n: number) => {
    if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
    return `$${n.toLocaleString()}`;
  };

  if (error && !marketData) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-500 text-sm font-bold">BTC</div>
          <h3 className="text-lg font-semibold">BTC/USDT</h3>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-zinc-600 mb-3"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <p className="text-gray-400 text-sm mb-2">Unable to load market data</p>
          <button onClick={() => { setError(false); setLoading(true); fetchMarketData(); }}
            className="text-gold-500 text-sm hover:underline">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="p-4 md:p-5 border-b border-zinc-800/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/15 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2"><circle cx="12" cy="12" r="10"/><text x="12" y="16" textAnchor="middle" fill="#f97316" fontSize="10" fontWeight="bold" stroke="none">₿</text></svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base md:text-lg font-semibold">BTC/USDT</h3>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-zinc-800 text-zinc-400">LIVE</span>
              </div>
              {marketData && (
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-lg md:text-xl font-bold">${marketData.price.toLocaleString()}</span>
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${marketData.change24h >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {marketData.change24h >= 0 ? '+' : ''}{marketData.change24h?.toFixed(2)}%
                  </span>
                </div>
              )}
            </div>
          </div>
          {/* Timeframe selector */}
          <div className="flex gap-1 bg-zinc-800/80 rounded-lg p-1">
            {TIMEFRAMES.map(tf => (
              <button key={tf.value} onClick={() => handleTimeframeChange(tf.value)}
                className={`px-2.5 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeTimeframe === tf.value
                    ? 'bg-gold-500 text-black'
                    : 'text-gray-400 hover:text-white'
                }`}>
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: 'min(400px, 50vw)' }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900 z-10">
            <div className="flex items-center gap-3">
              <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.3"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/></svg>
              <span className="text-sm text-gray-400">Loading chart...</span>
            </div>
          </div>
        )}
        <iframe
          key={chartKey}
          src={`https://s.tradingview.com/widgetembed/?frameElementId=gp_btc_chart&symbol=BINANCE:BTCUSDT&interval=${activeTimeframe}&hidesidetoolbar=1&symboledit=0&saveimage=0&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=exchange&show_popup_button=0&range=1M`}
          className="w-full h-full border-0"
          allowFullScreen
          onLoad={() => setLoading(false)}
          title="BTC/USDT Chart"
        />
      </div>

      {/* Stats bar */}
      {marketData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-zinc-800/50 border-t border-zinc-800/50">
          {[
            { label: '24h High', value: `$${marketData.high24h.toLocaleString()}`, color: 'text-emerald-400' },
            { label: '24h Low', value: `$${marketData.low24h.toLocaleString()}`, color: 'text-red-400' },
            { label: '24h Volume', value: formatNumber(marketData.volume24h), color: 'text-blue-400' },
            { label: '24h Change', value: `${marketData.change24h >= 0 ? '+' : ''}${marketData.change24h?.toFixed(2)}%`, color: marketData.change24h >= 0 ? 'text-emerald-400' : 'text-red-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-zinc-900 px-4 py-3">
              <p className="text-[10px] text-zinc-500 uppercase tracking-wider">{stat.label}</p>
              <p className={`text-sm font-semibold mt-0.5 ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
