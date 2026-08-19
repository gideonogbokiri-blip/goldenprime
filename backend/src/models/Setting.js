const supabase = require('../config/supabase');

class Setting {
  static async get(key, fallback = null) {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', key)
      .maybeSingle();
    if (error) throw error;
    return data ? data.value : fallback;
  }

  static async set(key, value) {
    const { data, error } = await supabase
      .from('settings')
      .upsert({ key, value, updated_at: new Date().toISOString() })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getAll() {
    const { data, error } = await supabase.from('settings').select('*');
    if (error) throw error;
    return data || [];
  }
}

module.exports = Setting;