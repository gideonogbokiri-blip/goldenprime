const supabase = require('../config/supabase');

class KYC {
  static async create({ userId, fullName, dateOfBirth, country, documentType, documentNumber }) {
    const { data, error } = await supabase
      .from('kyc')
      .insert({
        user_id: userId,
        full_name: fullName,
        date_of_birth: dateOfBirth,
        country,
        document_type: documentType,
        document_number: documentNumber,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByUserId(userId) {
    const { data, error } = await supabase
      .from('kyc')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async updateStatus(id, status, reviewedBy, rejectionReason = null) {
    const update = { status, reviewed_by: reviewedBy, reviewed_at: new Date().toISOString() };
    if (rejectionReason) update.rejection_reason = rejectionReason;

    const { data, error } = await supabase
      .from('kyc')
      .update(update)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAll({ limit = 50, offset = 0, status = null } = {}) {
    let query = supabase.from('kyc').select('*, users:user_id(email, first_name, last_name)');
    if (status) query = query.eq('status', status);
    query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  }
}

module.exports = KYC;
