'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { depositAPI } from '@/lib/api';

interface FeedItem {
  id: string;
  amount: number;
  displayName: string;
  created_at: string;
}

export default function DepositFeed() {
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [visibleIndex, setVisibleIndex] = useState(0);
  const [show, setShow] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    loadFeed();
    timerRef.current = setInterval(loadFeed, 15000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  useEffect(() => {
    if (feed.length === 0) return;
    setShow(true);
    const hide = setTimeout(() => setShow(false), 5000);
    const next = setTimeout(() => {
      setVisibleIndex(prev => (prev + 1) % feed.length);
    }, 6000);
    return () => { clearTimeout(hide); clearTimeout(next); };
  }, [visibleIndex, feed.length]);

  const loadFeed = async () => {
    try {
      const res = await depositAPI.feed(30);
      setFeed(res.data.feed || []);
    } catch {}
  };

  if (feed.length === 0) return null;

  const item = feed[visibleIndex];
  if (!item) return null;

  const timeAgo = getTimeAgo(item.created_at);

  return (
    <div className="fixed bottom-24 left-4 z-40 pointer-events-none hidden md:block">
      <AnimatePresence mode="wait">
        {show && (
          <motion.div
            key={item.id + visibleIndex}
            initial={{ opacity: 0, x: -40, y: 10 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -40, y: -10 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-xl px-4 py-3 shadow-2xl shadow-black/30 max-w-[280px]"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-zinc-400 truncate">
                  <span className="text-white font-medium">{item.displayName}</span> deposited
                </p>
                <p className="text-sm font-bold text-emerald-400">
                  ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </p>
                <p className="text-[9px] text-zinc-600">{timeAgo}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
