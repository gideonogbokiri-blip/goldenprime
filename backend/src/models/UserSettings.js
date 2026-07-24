const fs = require('fs');
const path = require('path');
const supabase = require('../config/supabase');

const DATA_FILE = path.join(__dirname, '../../data/user_settings.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '{}');
}

function loadAll() {
  ensureDataDir();
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function saveAll(data) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function get(userId) {
  const all = loadAll();
  return all[userId] || null;
}

function upsert(userId, updates) {
  const all = loadAll();
  all[userId] = { ...(all[userId] || {}), ...updates, updated_at: new Date().toISOString() };
  saveAll(all);
  return all[userId];
}

function getByReferralCode(code) {
  const all = loadAll();
  for (const [userId, settings] of Object.entries(all)) {
    if (settings.referral_code === code) return { user_id: userId };
  }
  return null;
}

async function getReferralCount(userId) {
  const all = loadAll();
  let count = 0;
  for (const [_, settings] of Object.entries(all)) {
    if (settings.referred_by === userId) count++;
  }
  return count;
}

async function getLeaderboard(limit = 20) {
  const { getTierInfo } = require('./Referral');
  const all = loadAll();
  const entries = [];
  for (const [userId, settings] of Object.entries(all)) {
    if (!settings.referral_code) continue;
    const count = await getReferralCount(userId);
    if (count > 0) {
      const { data: user } = await supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', userId)
        .single();
      const tierInfo = getTierInfo(count);
      entries.push({
        id: userId,
        email: user?.email || '',
        name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || '',
        referralCount: count,
        earnings: count * tierInfo.currentTier.rewardPerReferral,
        tier: tierInfo.currentTier.name,
      });
    }
  }
  entries.sort((a, b) => b.referralCount - a.referralCount);
  return entries.slice(0, limit);
}

module.exports = { get, upsert, getByReferralCode, getReferralCount, getLeaderboard };
