'use client';

import { motion } from 'framer-motion';

interface SuccessAnimationProps {
  title?: string;
  subtitle?: string;
  size?: number;
}

export default function SuccessAnimation({
  title = 'Success!',
  subtitle = '',
  size = 120,
}: SuccessAnimationProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
      >
        <svg width={size} height={size} viewBox="0 0 52 52">
          <circle
            className="checkmark-circle"
            cx="26"
            cy="26"
            r="25"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="2"
          />
          <path
            className="checkmark-check"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
            fill="none"
            stroke="#D4AF37"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </motion.div>
      {title && (
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-xl font-semibold text-gold-500"
        >
          {title}
        </motion.h3>
      )}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 text-sm text-center max-w-sm"
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
}
