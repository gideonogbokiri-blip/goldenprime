const supabase = require('../config/supabase');

class AdminLog {
  static async create({ adminId, action, targetType, targetId, details }) {
    const { data, error } = await supabase
      .from('admin_logs')
      .insert({
        admin_id: adminId,
        action,
        target_type: targetType || null,
        target_id: targetId || null,
        details: details || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAll({ limit = 100, offset = 0 } = {}) {
    const { data, error } = await supabase
      .from('admin_logs')
      .select('*, users:admin_id(email, first_name, last_name)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  static async getStats() {
    const [users, transactions, kycPending, kycApproved, pendingDeposits, pendingWithdrawals, verifiedUsers] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('transactions').select('id', { count: 'exact', head: true }),
      supabase.from('kyc').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('kyc').select('id', { count: 'exact', head: true }).eq('status', 'approved'),
      supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('type', 'deposit').eq('status', 'pending'),
      supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('type', 'withdrawal').eq('status', 'pending'),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('is_verified', true),
    ]);

    return {
      totalUsers: users.count || 0,
      totalTransactions: transactions.count || 0,
      kycPending: kycPending.count || 0,
      kycApproved: kycApproved.count || 0,
      pendingDeposits: pendingDeposits.count || 0,
      pendingWithdrawals: pendingWithdrawals.count || 0,
      verifiedUsers: verifiedUsers.count || 0,
    };
  }
}

module.exports = AdminLog;
