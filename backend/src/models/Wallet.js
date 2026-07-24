const supabase = require('../config/supabase');

class Wallet {
  static async getOrCreate(userId, currency) {
    const { data: existing } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();

    if (existing) return existing;

    const { data, error } = await supabase
      .from('wallets')
      .insert({ user_id: userId, currency })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAll(userId) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .order('currency');

    if (error) throw error;
    return data || [];
  }

  static async getBalance(userId, currency) {
    const { data } = await supabase
      .from('wallets')
      .select('balance')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();

    return data ? parseFloat(data.balance) : 0;
  }

  static async updateBalance(userId, currency, amount) {
    const { data: existing } = await supabase
      .from('wallets')
      .select('id, balance')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();

    if (existing) {
      const newBalance = parseFloat(existing.balance) + amount;
      const { error } = await supabase
        .from('wallets')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('wallets')
        .insert({ user_id: userId, currency, balance: amount });
      if (error) throw error;
    }
  }

  static async setBalance(userId, currency, balance) {
    const { data: existing } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', userId)
      .eq('currency', currency)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('wallets')
        .update({ balance, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('wallets')
        .insert({ user_id: userId, currency, balance });
      if (error) throw error;
    }
  }
}

module.exports = Wallet;
