'use client';

import { motion } from 'framer-motion';

interface TierBadgeProps {
  tier: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const tierConfig: Record<string, { bg: string; border: string; text: string; glow: string; gradient: string }> = {
  Bronze: {
    bg: 'bg-amber-900/20',
    border: 'border-amber-700/50',
    text: 'text-amber-500',
    glow: 'shadow-amber-700/20',
    gradient: 'from-amber-600 to-amber-800',
  },
  Silver: {
    bg: 'bg-gray-300/10',
    border: 'border-gray-400/50',
    text: 'text-gray-300',
    glow: 'shadow-gray-400/20',
    gradient: 'from-gray-300 to-gray-500',
  },
  Gold: {
    bg: 'bg-gold-500/10',
    border: 'border-gold-500/50',
    text: 'text-gold-500',
    glow: 'shadow-gold-500/30',
    gradient: 'from-gold-400 to-amber-500',
  },
  Platinum: {
    bg: 'bg-cyan-100/10',
    border: 'border-cyan-300/50',
    text: 'text-cyan-300',
    glow: 'shadow-cyan-300/20',
    gradient: 'from-cyan-200 to-blue-300',
  },
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-2 text-base',
};

export default function TierBadge({ tier, size = 'md', showLabel = true, className = '' }: TierBadgeProps) {
  const config = tierConfig[tier] || tierConfig.Bronze;

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${config.bg} ${config.border} ${config.text} ${sizes[size]} shadow-lg ${config.glow} ${className}`}
    >
      <span className={`bg-gradient-to-r ${config.gradient} bg-clip-text text-transparent font-bold`}>
        {tier}
      </span>
    </motion.div>
  );
}

export function TierProgress({ current, count, next, progress }: {
  current: { name: string; color: string; icon: string; rewardPerReferral: number };
  count: number;
  next: { name: string; color: string; icon: string; minReferrals: number; referralsNeeded: number } | null;
  progress: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">{current.icon}</span>
          <span className="font-semibold text-lg" style={{ color: current.color }}>{current.name}</span>
        </div>
        {next && (
          <div className="text-right text-sm text-gray-400">
            <span style={{ color: next.color }}>{next.icon} {next.name}</span>
            <span className="ml-1">({next.referralsNeeded} more)</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="relative w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="h-3 rounded-full relative"
          style={{
            background: next
              ? `linear-gradient(90deg, ${current.color}, ${next.color})`
              : `linear-gradient(90deg, ${current.color}, ${current.color})`,
          }}
        >
          {/* Shimmer on the bar */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              backgroundSize: '200% 100%',
              animation: 'gold-shimmer 2s linear infinite',
            }}
          />
        </motion.div>
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <span>{current.name} ({current.minReferrals}+ referrals)</span>
        {next ? (
          <span>{next.minReferrals}+ referrals</span>
        ) : (
          <span>Max tier!</span>
        )}
      </div>
    </div>
  );
}

export function TierCard({ tier, isActive, referralCount }: {
  tier: { name: string; minReferrals: number; rewardPerReferral: number; color: string; icon: string };
  isActive: boolean;
  referralCount: number;
}) {
  const config = tierConfig[tier.name] || tierConfig.Bronze;
  const unlocked = referralCount >= tier.minReferrals;

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.02 }}
      className={`rounded-xl p-4 border transition-all ${
        isActive
          ? `${config.bg} ${config.border} shadow-lg ${config.glow}`
          : unlocked
            ? 'bg-zinc-900 border-zinc-700'
            : 'bg-zinc-900/50 border-zinc-800 opacity-60'
      }`}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{tier.icon}</span>
        <div>
          <div className="font-bold" style={{ color: tier.color }}>{tier.name}</div>
          <div className="text-xs text-gray-400">{tier.minReferrals}+ referrals</div>
        </div>
      </div>
      <div className="text-sm">
        <span className="text-gray-400">Reward: </span>
        <span className="font-mono font-bold" style={{ color: tier.color }}>{tier.rewardPerReferral} GPG</span>
      </div>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-2 text-xs font-semibold"
          style={{ color: tier.color }}
        >
          Your current tier
        </motion.div>
      )}
    </motion.div>
  );
}
