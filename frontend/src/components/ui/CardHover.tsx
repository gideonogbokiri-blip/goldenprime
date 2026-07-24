'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface CardHoverProps {
  children: ReactNode;
  className?: string;
  gold?: boolean;
}

export default function CardHover({ children, className = '', gold = false }: CardHoverProps) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative ${className}`}
    >
      {gold && (
        <div className="absolute -inset-px rounded-xl bg-gradient-to-br from-gold-500/20 via-transparent to-gold-500/10 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      )}
      {children}
    </motion.div>
  );
}
