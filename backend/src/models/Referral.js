const UserSettings = require('../models/UserSettings');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const supabase = require('../config/supabase');

const TIERS = [
  { name: 'Bronze', minReferrals: 0, rewardPerReferral: 0.0001, color: '#CD7F32', icon: '🥉' },
  { name: 'Silver', minReferrals: 5, rewardPerReferral: 0.0002, color: '#C0C0C0', icon: '🥈' },
  { name: 'Gold', minReferrals: 15, rewardPerReferral: 0.0005, color: '#FFD700', icon: '🏆' },
  { name: 'Platinum', minReferrals: 50, rewardPerReferral: 0.001, color: '#E5E4E2', icon: '💎' },
];

function getTierInfo(referralCount) {
  let currentTier = TIERS[0];
  let nextTier = TIERS[1] || null;

  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (referralCount >= TIERS[i].minReferrals) {
      currentTier = TIERS[i];
      nextTier = TIERS[i + 1] || null;
      break;
    }
  }

  const progress = nextTier
    ? ((referralCount - currentTier.minReferrals) / (nextTier.minReferrals - currentTier.minReferrals)) * 100
    : 100;

  return {
    currentTier: {
      name: currentTier.name,
      rewardPerReferral: currentTier.rewardPerReferral,
      color: currentTier.color,
      icon: currentTier.icon,
      minReferrals: currentTier.minReferrals,
    },
    nextTier: nextTier ? {
      name: nextTier.name,
      rewardPerReferral: nextTier.rewardPerReferral,
      color: nextTier.color,
      icon: nextTier.icon,
      minReferrals: nextTier.minReferrals,
      referralsNeeded: nextTier.minReferrals - referralCount,
    } : null,
    progress: Math.min(Math.max(progress, 0), 100),
    allTiers: TIERS.map(t => ({ name: t.name, minReferrals: t.minReferrals, rewardPerReferral: t.rewardPerReferral, color: t.color, icon: t.icon })),
  };
}

function generateReferralCode(userId) {
  return `GP-${userId.slice(0, 8).toUpperCase()}`;
}

async function creditReferrer(referrerId) {
  const count = await UserSettings.getReferralCount(referrerId);
  const tierInfo = getTierInfo(count);
  const REWARD = tierInfo.currentTier.rewardPerReferral;

  const { data: wallet } = await supabase
    .from('wallets')
    .select('id, balance')
    .eq('user_id', referrerId)
    .eq('currency', 'GPG')
    .single();

  if (wallet) {
    const newBalance = parseFloat(wallet.balance) + REWARD;
    await supabase.from('wallets').update({ balance: newBalance, updated_at: new Date().toISOString() }).eq('id', wallet.id);
  } else {
    await supabase.from('wallets').insert({ user_id: referrerId, currency: 'GPG', balance: REWARD });
  }

  await Transaction.create({
    userId: referrerId,
    type: 'referral_reward',
    currency: 'GPG',
    amount: REWARD,
    usdValue: REWARD * 50,
    status: 'completed',
    metadata: { source: 'referral_signup', reward: REWARD, tier: tierInfo.currentTier.name },
  });

  return REWARD;
}

async function getReferralInfo(userId) {
  const settings = await UserSettings.get(userId);
  const code = settings?.referral_code || generateReferralCode(userId);
  const count = settings ? await UserSettings.getReferralCount(userId) : 0;
  const tierInfo = getTierInfo(count);

  return {
    referralCode: code,
    referralCount: count,
    earnings: count * tierInfo.currentTier.rewardPerReferral,
    rewardPerReferral: tierInfo.currentTier.rewardPerReferral,
    tier: tierInfo,
  };
}

async function getLeaderboard(limit = 20) {
  return UserSettings.getLeaderboard(limit);
}

module.exports = { generateReferralCode, creditReferrer, getReferralInfo, getLeaderboard, getTierInfo, TIERS };
