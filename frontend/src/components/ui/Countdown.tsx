'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownProps {
  targetDate: string;
  className?: string;
}

function Digit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, '0');
  const [prevDisplay, setPrevDisplay] = useState(display);
  const [flipping, setFlipping] = useState(false);

  useEffect(() => {
    if (display !== prevDisplay) {
      setFlipping(true);
      const timer = setTimeout(() => {
        setPrevDisplay(display);
        setFlipping(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [display, prevDisplay]);

  return (
    <div className="text-center">
      <div className="countdown-digit bg-zinc-900/80 border border-gold-500/30 rounded-xl px-4 py-3 min-w-[80px] relative overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={display}
            initial={flipping ? { rotateX: -90, opacity: 0 } : false}
            animate={{ rotateX: 0, opacity: 1 }}
            exit={{ rotateX: 90, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="text-3xl font-bold font-mono text-gold-500 block"
            style={{ transformOrigin: 'center' }}
          >
            {display}
          </motion.span>
        </AnimatePresence>
        {/* Subtle reflection */}
        <div className="absolute inset-x-0 top-1/2 h-px bg-white/5" />
      </div>
      <span className="text-xs text-gray-400 mt-2 block">{label}</span>
    </div>
  );
}

export default function Countdown({ targetDate, className = '' }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const launch = new Date(targetDate).getTime();
    const tick = () => {
      const diff = Math.max(0, launch - Date.now());
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className={`flex gap-4 justify-center ${className}`}>
      <Digit value={timeLeft.days} label="Days" />
      <Digit value={timeLeft.hours} label="Hours" />
      <Digit value={timeLeft.minutes} label="Minutes" />
      <Digit value={timeLeft.seconds} label="Seconds" />
    </div>
  );
}
