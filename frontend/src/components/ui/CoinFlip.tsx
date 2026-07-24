'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface CoinFlipProps {
  balance: number;
  className?: string;
}

export default function CoinFlip({ balance, className = '' }: CoinFlipProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className={`cursor-pointer perspective-400 ${className}`}
      onClick={() => setFlipped(!flipped)}
      title="Click to flip"
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-full"
      >
        {/* Front - coin image */}
        <div
          className="rounded-xl p-6 bg-gradient-to-br from-gold-500/10 to-zinc-900 border border-gold-500/30"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <p className="text-gray-400 text-sm mb-1">GPG Balance</p>
          <p className="text-3xl font-bold text-gold-500">{balance.toFixed(4)}</p>
          <p className="text-xs text-gray-400">@ $50/coin</p>
          <div className="mt-2 text-xs text-gold-500/50">Tap to flip</div>
        </div>

        {/* Back - USD value */}
        <div
          className="absolute inset-0 rounded-xl p-6 bg-gradient-to-br from-gold-600/20 to-zinc-900 border border-gold-500/40"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <p className="text-gray-400 text-sm mb-1">GPG Value</p>
          <p className="text-3xl font-bold text-green-500">${(balance * 50).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
          <p className="text-xs text-gray-400">{balance} coins x $50</p>
          <div className="mt-2 text-xs text-gold-500/50">Tap to flip</div>
        </div>
      </motion.div>
    </div>
  );
}
