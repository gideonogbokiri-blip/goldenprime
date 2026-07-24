const supabase = require('../config/supabase');
const AdminLog = require('../models/AdminLog');
const KYC = require('../models/KYC');

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
  return data || [];
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
  updateUserRole,
  getTransactions,
  updateTransactionStatus,
  getKYCRequests,
  approveKYC,
  rejectKYC,
  getLogs,
};
