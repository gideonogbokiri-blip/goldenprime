const supabase = require('../config/supabase');

class Transaction {
  static async create({ userId, type, currency, amount, usdValue, status, stripePaymentId, txHash, metadata }) {
    const { data, error } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type,
        currency,
        amount,
        usd_value: usdValue || null,
        status: status || 'pending',
        stripe_payment_id: stripePaymentId || null,
        tx_hash: txHash || null,
        metadata: metadata || null,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateStatus(id, status) {
    const { data, error } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async findByUser(userId, { limit = 50, offset = 0 } = {}) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findByStripePaymentId(paymentId) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('stripe_payment_id', paymentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }
}

module.exports = Transaction;
