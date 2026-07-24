const supabase = require('../config/supabase');

async function get(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function upsert(userId, updates) {
  const existing = await get(userId);
  const payload = { user_id: userId, ...updates, updated_at: new Date().toISOString() };

  if (existing) {
    const { data, error } = await supabase
      .from('user_settings')
      .update(payload)
      .eq('user_id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await supabase
      .from('user_settings')
      .insert(payload)
      .select()
      .single();
    if (error) throw error;
    return data;
  }
}

async function getByReferralCode(code) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('user_id, referral_code')
    .eq('referral_code', code)
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getReferralCount(userId) {
  const { count, error } = await supabase
    .from('user_settings')
    .select('*', { count: 'exact', head: true })
    .eq('referred_by', userId);
  if (error) throw error;
  return count || 0;
}

async function getLeaderboard(limit = 20) {
  const { getTierInfo } = require('./Referral');
  const { data: allSettings, error } = await supabase
    .from('user_settings')
    .select('user_id, referral_code')
    .not('referral_code', 'is', null);
  if (error) throw error;

  const entries = [];
  for (const settings of allSettings || []) {
    const count = await getReferralCount(settings.user_id);
    if (count > 0) {
      const { data: user } = await supabase
        .from('users')
        .select('email, first_name, last_name')
        .eq('id', settings.user_id)
        .maybeSingle();
      const tierInfo = getTierInfo(count);
      entries.push({
        id: settings.user_id,
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
