'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { goldAPI } from '@/lib/api';
import { StaggerContainer, StaggerItem } from '@/components/ui/Animations';
import { fireReferralConfetti } from '@/lib/confetti';
import TierBadge, { TierProgress, TierCard } from '@/components/ui/TierBadge';

export default function ReferralsPage() {
  const router = useRouter();
  const [referral, setReferral] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) { router.push('/login'); return; }
    Promise.all([
      goldAPI.getReferralInfo().then(r => setReferral(r.data)),
      goldAPI.getLeaderboard().then(r => setLeaderboard(r.data.leaderboard || [])),
    ]).catch(() => {}).finally(() => setLoading(false));
  }, [router]);

  const copyCode = () => {
    navigator.clipboard.writeText(referral?.referralCode || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(referral?.referralLink || '');
    setCopied(true);
    fireReferralConfetti();
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950">
        <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</div>
          <div className="skeleton h-4 w-32 rounded" />
        </nav>
        <div className="max-w-4xl mx-auto px-6 py-10">
          <div className="skeleton h-8 w-48 mb-8 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
          </div>
          <div className="skeleton h-24 rounded-xl mb-8" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
            <div className="skeleton h-32 rounded-xl" />
          </div>
          <div className="skeleton h-48 rounded-xl" />
        </div>
      </main>
    );
  }

  const tier = referral?.tier;
  const tierInfo = tier?.currentTier;

  return (
    <main className="min-h-screen bg-zinc-950">
      <nav className="border-b border-zinc-800 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-2xl font-bold"><span className="text-gold-500">Golden</span>Prime</Link>
        <Link href="/dashboard" className="text-gray-400 hover:text-white">Back to Dashboard</Link>
      </nav>
      <div className="max-w-4xl mx-auto px-6 py-10">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-semibold mb-2 flex items-center gap-3"
        >
          Refer & Earn
          {tierInfo && <TierBadge tier={tierInfo.name} size="lg" />}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-gray-400 mb-8"
        >
          Invite friends and earn GPG — higher tiers earn more per referral
        </motion.p>

        {/* Tier Progress */}
        {tier && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8"
          >
            <h3 className="text-lg font-semibold mb-4">Your Tier Progress</h3>
            <TierProgress
              current={tier.currentTier}
              count={referral.referralCount}
              next={tier.nextTier}
              progress={tier.progress}
            />
          </motion.div>
        )}

        {/* Referral stats */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8" stagger={0.1}>
          <StaggerItem>
            <div className="bg-gradient-to-br from-gold-500/10 to-zinc-900 border border-gold-500/30 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Total Referrals</p>
              <p className="text-4xl font-bold text-gold-500">{referral?.referralCount || 0}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">GPG Earned</p>
              <p className="text-4xl font-bold">{referral?.earnings?.toFixed(4) || '0.0000'}</p>
              <p className="text-sm text-gray-400">~ ${((referral?.earnings || 0) * 50).toFixed(2)}</p>
            </div>
          </StaggerItem>
          <StaggerItem>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <p className="text-gray-400 text-sm mb-1">Current Reward</p>
              <p className="text-4xl font-bold" style={{ color: tierInfo?.color }}>{referral?.rewardPerReferral || 0.0001}</p>
              <p className="text-sm text-gray-400">GPG per referral</p>
            </div>
          </StaggerItem>
        </StaggerContainer>

        {/* Tier Cards */}
        {tier?.allTiers && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold mb-4">Tier Benefits</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tier.allTiers.map((t: any) => (
                <TierCard
                  key={t.name}
                  tier={t}
                  isActive={t.name === tierInfo?.name}
                  referralCount={referral?.referralCount || 0}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* Referral code & link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8"
        >
          <h3 className="text-xl font-semibold mb-4">Your Referral Link</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-400 mb-2">Referral Code</p>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg font-mono text-lg font-bold text-gold-500">
                  {referral?.referralCode}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyCode}
                  className="px-6 py-3 bg-zinc-800 border border-zinc-700 rounded-lg font-semibold hover:bg-zinc-700 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </motion.button>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-2">Referral Link</p>
              <div className="flex gap-2">
                <div className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-gray-300 truncate">
                  {referral?.referralLink}
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={copyLink}
                  className="px-6 py-3 bg-gold-500 text-black rounded-lg font-semibold hover:bg-gold-400 transition-colors"
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </motion.button>
              </div>
            </div>
          </div>
          <div className="mt-6 bg-gold-500/10 border border-gold-500/30 rounded-lg p-4">
            <p className="text-sm"><span className="text-gold-500 font-semibold">How it works:</span> Share your referral link. When friends sign up, you earn GPG at your current tier rate. Reach higher tiers for bigger rewards!</p>
          </div>
        </motion.div>

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
        >
          <h3 className="text-xl font-semibold mb-4">Top Referrers</h3>
          {leaderboard.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No referrals yet. Be the first!</p>
          ) : (
            <StaggerContainer className="space-y-3" stagger={0.08}>
              {leaderboard.map((entry, i) => (
                <StaggerItem key={entry.id}>
                  <div className="flex items-center gap-4 py-3 border-b border-zinc-800/50 last:border-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                      i === 0 ? 'bg-gold-500 text-black' : i === 1 ? 'bg-gray-300 text-black' : i === 2 ? 'bg-amber-600 text-black' : 'bg-zinc-800 text-gray-400'
                    }`}>
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{entry.name}</p>
                        {entry.tier && <TierBadge tier={entry.tier} size="sm" />}
                      </div>
                      <p className="text-sm text-gray-400">{entry.referralCount} referrals</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gold-500">{entry.earnings.toFixed(4)} GPG</p>
                      <p className="text-xs text-gray-400">~ ${(entry.earnings * 50).toFixed(2)}</p>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </motion.div>
      </div>
    </main>
  );
}
