const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

class User {
  static async create({ email, passwordHash, firstName, lastName }) {
    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: passwordHash,
        first_name: firstName || null,
        last_name: lastName || null,
      })
      .select('id, email, first_name, last_name, role, is_verified, created_at')
      .single();

    if (error) throw error;
    return data;
  }

  static async findByEmail(email) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  static async findById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_verified, created_at')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  static async setVerificationToken(userId) {
    const token = uuidv4();
    const { error } = await supabase
      .from('users')
      .update({ verification_token: token })
      .eq('id', userId);

    if (error) throw error;
    return token;
  }

  static async verifyEmail(token) {
    const { data, error } = await supabase
      .from('users')
      .update({ is_verified: true, verification_token: null })
      .eq('verification_token', token)
      .select('id, email')
      .single();

    if (error) throw error;
    return data;
  }

  static async setResetToken(email) {
    const token = uuidv4();
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('users')
      .update({ reset_token: token, reset_token_expires: expires })
      .eq('email', email)
      .select('id')
      .single();

    if (error || !data) return null;
    return { token, expires };
  }

  static async resetPassword(token, passwordHash) {
    const { data, error } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null,
      })
      .eq('reset_token', token)
      .gt('reset_token_expires', new Date().toISOString())
      .select('id, email')
      .single();

    if (error) throw error;
    return data;
  }

  static async updatePassword(userId, passwordHash) {
    const { error } = await supabase
      .from('users')
      .update({ password_hash: passwordHash })
      .eq('id', userId);

    if (error) throw error;
  }
}

module.exports = User;
