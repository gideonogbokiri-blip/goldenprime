'use client';

import { motion } from 'framer-motion';

interface GoldCoinProps {
  size?: number;
  showGlow?: boolean;
  floating?: boolean;
  spinning?: boolean;
  className?: string;
}

export default function GoldCoin({
  size = 192,
  showGlow = true,
  floating = true,
  spinning = false,
  className = '',
}: GoldCoinProps) {
  const innerSize = size * 0.85;

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      animate={floating ? { y: [0, -10, 0] } : {}}
      transition={floating ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : {}}
    >
      {/* Outer glow */}
      {showGlow && (
        <div
          className="absolute inset-0 rounded-full animate-pulse-gold"
          style={{
            background: 'radial-gradient(circle, rgba(212,175,55,0.25) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      )}

      {/* Coin body */}
      <motion.div
        className="relative rounded-full border-4 border-gold-400/50 shadow-2xl shadow-gold-500/30 overflow-hidden"
        style={{
          width: innerSize,
          height: innerSize,
          background: 'linear-gradient(135deg, #FFD700 0%, #D4AF37 40%, #B8960F 70%, #D4AF37 100%)',
          transformStyle: 'preserve-3d',
        }}
        animate={spinning ? { rotateY: [0, 360] } : {}}
        transition={spinning ? { duration: 3, ease: 'easeInOut' } : {}}
      >
        {/* Shine overlay */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
          }}
        />

        {/* Animated shimmer across surface */}
        <div
          className="absolute inset-0 rounded-full overflow-hidden"
        >
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'gold-shimmer 3s linear infinite',
            }}
          />
        </div>

        {/* Inner ring */}
        <div
          className="absolute rounded-full border-2 border-gold-300/30"
          style={{
            inset: '12%',
          }}
        />

        {/* Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className="font-bold text-black leading-none"
            style={{ fontSize: innerSize * 0.28 }}
          >
            GP
          </div>
          <div
            className="text-black/60 font-semibold"
            style={{ fontSize: innerSize * 0.12 }}
          >
            AU
          </div>
        </div>
      </motion.div>

      {/* Floating particles */}
      {showGlow && (
        <div className="particles">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${20 + Math.random() * 60}%`,
                top: `${20 + Math.random() * 60}%`,
                animationDelay: `${i * 0.4}s`,
                width: 2 + Math.random() * 3,
                height: 2 + Math.random() * 3,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
