const supabase = require('../config/supabase');
const AdminLog = require('../models/AdminLog');
const KYC = require('../models/KYC');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const Setting = require('../models/Setting');
const Chat = require('../models/Chat');

async function getDashboard() {
  const stats = await AdminLog.getStats();
  return stats;
}

async function getUsers({ limit = 50, offset = 0, search = null } = {}) {
  let query = supabase.from('users').select('id, email, first_name, last_name, role, is_verified, created_at');
  if (search) {
    query = query.or(`email.ilike.%${search}%,first_name.ilike.%${search}%,last_name.ilike.%${search}%`);
  }
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;

  const users = data || [];
  const defaultProfitRate = Number(await Setting.get('expected_profit_rate', 3)) || 0;
  const userIds = users.map((user) => user.id);
  let profitRates = [];
  if (userIds.length) {
    const { data: rates, error: rateError } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', userIds.map(Setting.userExpectedProfitRateKey));
    if (rateError) throw rateError;
    profitRates = rates || [];
  }
  const rateByUser = new Map(profitRates.map((rate) => [rate.key.slice('user_expected_profit_rate:'.length), rate.value]));
  const withBalance = await Promise.all(users.map(async (u) => {
    const balance = await Wallet.getBalance(u.id, 'USD');
    const override = rateByUser.get(u.id);
    return {
      ...u,
      usdBalance: balance,
      expectedProfitRate: override == null ? defaultProfitRate : Number(override),
      hasCustomExpectedProfitRate: override != null,
    };
  }));
  return withBalance;
}

async function deleteUser(userId, adminId) {
  if (userId === adminId) {
    throw Object.assign(new Error('You cannot delete your own admin account.'), { status: 400 });
  }

  const { data: user, error: lookupError } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('id', userId)
    .maybeSingle();
  if (lookupError) throw lookupError;
  if (!user) throw Object.assign(new Error('User not found.'), { status: 404 });
  if (user.role !== 'user') {
    throw Object.assign(new Error('Admin accounts cannot be deleted from this action.'), { status: 403 });
  }

  const { data: referrals, error: referralLookupError } = await supabase
    .from('user_settings')
    .select('user_id')
    .eq('referred_by', userId);
  if (referralLookupError) throw referralLookupError;
  const referredUserIds = (referrals || []).map((referral) => referral.user_id);
  if (referredUserIds.length) {
    const { error } = await supabase
      .from('user_settings')
      .update({ referred_by: null })
      .in('user_id', referredUserIds);
    if (error) throw error;
  }

  const { data: deleted, error: deleteError } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
    .eq('role', 'user')
    .select('id, email')
    .maybeSingle();
  if (deleteError || !deleted) {
    if (referredUserIds.length) {
      await supabase.from('user_settings').update({ referred_by: userId }).in('user_id', referredUserIds);
    }
    if (deleteError) throw deleteError;
    throw Object.assign(new Error('User not found or is no longer eligible for deletion.'), { status: 404 });
  }

  const { error: profitRateCleanupError } = await supabase
    .from('settings')
    .delete()
    .eq('key', Setting.userExpectedProfitRateKey(userId));
  if (profitRateCleanupError) {
    console.error('Failed to remove deleted user expected-profit setting:', profitRateCleanupError.message);
  }

  await AdminLog.create({
    adminId,
    action: 'delete_user_account',
    targetType: 'user',
    targetId: userId,
    details: { email: user.email },
  });

  return deleted;
}

async function updateUserExpectedProfit(userId, expectedProfitRate, adminId) {
  const { data: user, error } = await supabase.from('users').select('id').eq('id', userId).maybeSingle();
  if (error) throw error;
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  await Setting.set(Setting.userExpectedProfitRateKey(userId), expectedProfitRate);
  await AdminLog.create({
    adminId,
    action: 'update_user_expected_profit',
    targetType: 'user',
    targetId: userId,
    details: { expectedProfitRate },
  });

  const defaultRate = Number(await Setting.get('expected_profit_rate', 3)) || 0;
  return {
    id: userId,
    expectedProfitRate: expectedProfitRate == null ? defaultRate : Number(expectedProfitRate),
    hasCustomExpectedProfitRate: expectedProfitRate != null,
  };
}

async function sendMailerMessage({ userId, allUsers, subject, body }, adminId) {
  const cleanSubject = String(subject || '').trim().replace(/[\r\n]+/g, ' ');
  const cleanBody = String(body || '').trim();
  if (!cleanSubject || cleanSubject.length > 160) {
    throw Object.assign(new Error('Subject is required and must be 160 characters or fewer.'), { status: 400 });
  }
  if (!cleanBody || cleanBody.length > 10000) {
    throw Object.assign(new Error('Message is required and must be 10,000 characters or fewer.'), { status: 400 });
  }

  let recipients;
  if (allUsers) {
    const { data, error, count } = await supabase
      .from('users')
      .select('id, email', { count: 'exact' })
      .eq('role', 'user')
      .not('email', 'is', null)
      .order('created_at', { ascending: true })
      .limit(500);
    if (error) throw error;
    if (count > 500) {
      throw Object.assign(new Error('There are more than 500 users. Narrow the recipient list and send in smaller groups.'), { status: 400 });
    }
    recipients = data || [];
  } else {
    if (!userId) throw Object.assign(new Error('Choose a recipient or select all users.'), { status: 400 });
    const { data, error } = await supabase
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .maybeSingle();
    if (error) throw error;
    if (!data?.email) throw Object.assign(new Error('User or email address not found.'), { status: 404 });
    recipients = [data];
  }

  if (!recipients.length) throw Object.assign(new Error('No email recipients found.'), { status: 400 });

  const { sendAdminEmail } = require('./emailService');
  let sentCount = 0;
  let failedCount = 0;
  let firstFailure = null;
  const recipientResults = [];
  for (const recipient of recipients) {
    try {
      await sendAdminEmail(recipient.email, cleanSubject, cleanBody);
      sentCount += 1;
      recipientResults.push({ email: recipient.email, status: 'sent' });
    } catch (err) {
      failedCount += 1;
      firstFailure ||= err;
      recipientResults.push({ email: recipient.email, status: 'failed' });
    }
  }

  await AdminLog.create({
    adminId,
    action: 'admin_mailer_send',
    targetType: allUsers ? 'system' : 'user',
    targetId: allUsers ? null : userId,
    details: { allUsers: Boolean(allUsers), recipientCount: recipients.length, sentCount, failedCount, subject: cleanSubject, body: cleanBody, recipients: recipientResults },
  });

  if (sentCount === 0 && firstFailure) {
    throw Object.assign(new Error(firstFailure.code === 'EMAIL_NOT_CONFIGURED'
      ? firstFailure.message
      : 'Email could not be sent. Check the server email configuration.'), { status: 503 });
  }

  return { recipientCount: recipients.length, sentCount, failedCount };
}

async function getMailerHistory() {
  return AdminLog.getMailerHistory();
}

async function fundWallet(userId, amount, adminId, note) {
  if (!amount || amount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });

  const { data: user } = await supabase.from('users').select('email').eq('id', userId).maybeSingle();
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  await Wallet.updateBalance(userId, 'USD', amount);

  const tx = await Transaction.create({
    userId,
    type: 'deposit',
    currency: 'USD',
    amount,
    usdValue: amount,
    status: 'completed',
    metadata: {
      method: 'admin_manual',
      fundedBy: adminId,
      fundedAt: new Date().toISOString(),
      note: note || null,
    },
  });

  await AdminLog.create({
    adminId,
    action: 'manual_fund',
    targetType: 'user',
    targetId: userId,
    details: { amount, note },
  });

  if (user.email) {
    try {
      const { sendDepositApprovedEmail } = require('./emailService');
      await sendDepositApprovedEmail(user.email, parseFloat(amount).toFixed(2));
    } catch (err) {
      console.error('Failed to send fund email:', err.message);
    }
  }

  return { transaction: tx, usdBalance: await Wallet.getBalance(userId, 'USD') };
}

async function getWithdrawals({ limit = 50, offset = 0, status = null } = {}) {
  let query = supabase.from('transactions').select('*, users:user_id(email, first_name, last_name)').eq('type', 'withdrawal');
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function approveWithdrawal(txId, adminId, notes) {
  const { approveWithdrawal } = require('./paymentService');
  const withdrawal = await approveWithdrawal(txId, adminId, notes);
  await AdminLog.create({
    adminId,
    action: 'approve_withdrawal',
    targetType: 'transaction',
    targetId: txId,
    details: { amount: withdrawal.amount, notes },
  });
  return withdrawal;
}

async function rejectWithdrawal(txId, adminId, reason) {
  const { rejectWithdrawal } = require('./paymentService');
  const withdrawal = await rejectWithdrawal(txId, adminId, reason);
  await AdminLog.create({
    adminId,
    action: 'reject_withdrawal',
    targetType: 'transaction',
    targetId: txId,
    details: { amount: withdrawal.amount, reason },
  });
  return withdrawal;
}

async function getSettings() {
  const all = await Setting.getAll();
  const acc = {};
  for (const s of all) {
    if (s.key === 'crypto_wallet' && typeof s.value === 'object' && s.value) {
      const cw = s.value;
      const btc = cw.bitcoin?.address || cw.btc || null;
      const eth = cw.ethereum?.address || cw.eth || null;
      const usdt = cw.usdt || null;
      if (btc && !all.find(x => x.key === 'btc_wallet')) acc.btc_wallet = btc;
      if (eth && !all.find(x => x.key === 'eth_wallet')) acc.eth_wallet = eth;
      if (usdt && !all.find(x => x.key === 'usdt_wallet')) acc.usdt_wallet = usdt;
    }
    acc[s.key] = s.value;
  }
  return acc;
}

async function saveSettings(updates, adminId) {
  const allowed = [
    'expected_profit_rate', 'min_deposit', 'max_deposit',
    'bank_details', 'crypto_wallet',
    'btc_wallet', 'eth_wallet', 'usdt_wallet', 'wallet_network',
  ];
  const saved = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      let value = updates[key];
      if (typeof value === 'string' && (key === 'bank_details' || key === 'crypto_wallet')) {
        value = JSON.parse(value);
      }
      if (typeof value === 'string') value = value.trim();
      saved[key] = await Setting.set(key, value);
    }
  }

  if (updates.crypto_wallet !== undefined) {
    const cw = updates.crypto_wallet;
    if (typeof cw === 'string' ? JSON.parse(cw) : cw) {
      const parsed = typeof cw === 'string' ? JSON.parse(cw) : cw;
      const btc = parsed.bitcoin?.address || parsed.btc || null;
      const eth = parsed.ethereum?.address || parsed.eth || null;
      const usdt = parsed.usdt || null;
      if (btc) await Setting.set('btc_wallet', btc);
      if (eth) await Setting.set('eth_wallet', eth);
      if (usdt) await Setting.set('usdt_wallet', usdt);
    }
  }

  await AdminLog.create({
    adminId,
    action: 'update_settings',
    targetType: 'system',
    targetId: null,
    details: { keys: Object.keys(saved) },
  });
  return saved;
}

async function getChatThreads() {
  return Chat.getAdminThreads();
}

async function getChatConversation(userId) {
  await Chat.markAdminRead(userId);
  return Chat.getConversation(userId);
}

async function adminReply(userId, { message, attachment, creditAmount, creditNote }, adminId) {
  const msg = await Chat.send(userId, 'admin', { message, attachment });

  let credit = null;
  if (creditAmount) {
    credit = await fundWallet(userId, creditAmount, adminId, creditNote || `Credited from chat by admin`);
  }
  return { message: msg, credit };
}

async function updateUserRole(userId, role, adminId) {
  const { data, error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId)
    .select('id, email, first_name, last_name, role')
    .single();

  if (error) throw error;

  await AdminLog.create({
    adminId,
    action: 'update_role',
    targetType: 'user',
    targetId: userId,
    details: { newRole: role },
  });

  return data;
}

async function getTransactions({ limit = 50, offset = 0, status = null, type = null } = {}) {
  let query = supabase.from('transactions').select('*, users:user_id(email, first_name, last_name)');
  if (status) query = query.eq('status', status);
  if (type) query = query.eq('type', type);
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function updateTransactionStatus(txId, status, adminId) {
  const { data, error } = await supabase
    .from('transactions')
    .update({ status })
    .eq('id', txId)
    .select()
    .single();

  if (error) throw error;

  await AdminLog.create({
    adminId,
    action: 'update_transaction_status',
    targetType: 'transaction',
    targetId: txId,
    details: { newStatus: status },
  });

  return data;
}

async function getKYCRequests({ limit = 50, offset = 0, status = null } = {}) {
  const kycList = await KYC.getAll({ limit, offset, status });
  return kycList;
}

async function approveKYC(kycId, adminId) {
  const KYC = require('../models/KYC');
  const kyc = await KYC.updateStatus(kycId, 'approved', adminId);

  const { error } = await supabase
    .from('users')
    .update({ is_verified: true })
    .eq('id', kyc.user_id);
  if (error) throw error;

  await AdminLog.create({
    adminId,
    action: 'approve_kyc',
    targetType: 'kyc',
    targetId: kycId,
    details: { userId: kyc.user_id },
  });

  return kyc;
}

async function rejectKYC(kycId, adminId, reason) {
  const KYC = require('../models/KYC');
  const kyc = await KYC.updateStatus(kycId, 'rejected', adminId, reason);

  await AdminLog.create({
    adminId,
    action: 'reject_kyc',
    targetType: 'kyc',
    targetId: kycId,
    details: { userId: kyc.user_id, reason },
  });

  return kyc;
}

async function getLogs({ limit = 100, offset = 0 } = {}) {
  const logs = await AdminLog.getAll({ limit, offset });
  return logs;
}

module.exports = {
  getDashboard,
  getUsers,
  deleteUser,
  updateUserExpectedProfit,
  sendMailerMessage,
  getMailerHistory,
  fundWallet,
  updateUserRole,
  getTransactions,
  updateTransactionStatus,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  getSettings,
  saveSettings,
  getChatThreads,
  getChatConversation,
  adminReply,
  getKYCRequests,
  approveKYC,
  rejectKYC,
  getLogs,
};
