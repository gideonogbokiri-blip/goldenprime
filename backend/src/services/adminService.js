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
  const withBalance = await Promise.all(users.map(async (u) => {
    const balance = await Wallet.getBalance(u.id, 'USD');
    return { ...u, usdBalance: balance };
  }));
  return withBalance;
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
  return all.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});
}

async function saveSettings(updates, adminId) {
  const allowed = ['expected_profit_rate', 'min_deposit', 'max_deposit', 'bank_details', 'crypto_wallet'];
  const saved = {};
  for (const key of allowed) {
    if (updates[key] !== undefined) {
      const value = typeof updates[key] === 'string' && (key === 'bank_details' || key === 'crypto_wallet')
        ? JSON.parse(updates[key])
        : updates[key];
      saved[key] = await Setting.set(key, value);
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
