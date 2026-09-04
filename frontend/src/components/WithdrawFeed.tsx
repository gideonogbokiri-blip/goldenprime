'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAMES = [
  'James O.', 'Amanda R.', 'Daniel K.', 'Sofia M.', 'Chris B.', 'Grace L.',
  'Michael T.', 'Hannah W.', 'Peter A.', 'Linda F.', 'Victor N.', 'Rebecca J.',
  'Samuel D.', 'Olivia P.', 'Kevin S.', 'Nina C.',
];

const AMOUNTS = [
  1200, 850, 3400, 2100, 500, 2750, 1600, 980,
  4200, 1400, 750, 3100, 1900, 600, 2650, 1150,
];

export default function WithdrawFeed() {
  const [visible, setVisible] = useState<{ id: number; item: number } | null>(null);
  const counterRef = useRef(0);

  useEffect(() => {
    const id = setInterval(() => {
      counterRef.current += 1;
      setVisible({ id: Date.now() + counterRef.current, item: counterRef.current });
    }, 9000);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;
  const key = visible.item;
  const name = NAMES[Math.abs(key) % NAMES.length];
  const amount = AMOUNTS[Math.abs(key) % AMOUNTS.length];

  return (
    <div className="fixed bottom-24 right-4 z-40 pointer-events-none hidden md:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={visible.id}
          initial={{ opacity: 0, x: 40, y: 10 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 40, y: -10 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl shadow-black/30 max-w-[260px]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gold-500/15 flex items-center justify-center shrink-0">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a4 4 0 0 0-8 0v2" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-zinc-400 truncate">
                <span className="text-white font-medium">{name}</span> withdrew
              </p>
              <p className="text-sm font-bold text-gold-400">
                ${amount.toLocaleString()}
              </p>
              <p className="text-[9px] text-zinc-600">just now</p>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}