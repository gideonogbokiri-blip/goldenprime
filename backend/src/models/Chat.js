const supabase = require('../config/supabase');

class Chat {
  static async send(userId, sender, { message, attachment }) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({ user_id: userId, sender, message: message || null, attachment: attachment || null })
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  static async getUserMessages(userId, { limit = 50 } = {}) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).reverse();
  }

  static async getConversation(userId) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  }

  static async getAdminThreads() {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*, users:user_id(email, first_name, last_name)')
      .order('created_at', { ascending: true });
    if (error) throw error;

    const byUser = new Map();
    for (const msg of data || []) {
      if (!byUser.has(msg.user_id)) {
        byUser.set(msg.user_id, { user: msg.users, messages: [] });
      }
      byUser.get(msg.user_id).messages.push(msg);
    }

    return [...byUser.values()].map(({ user, messages }) => {
      const unread = messages.filter((m) => m.sender === 'user' && !m.read).length;
      return {
        userId: user?.id || messages[0]?.user_id,
        email: user?.email || '',
        name: `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.email || '',
        unread,
        lastMessage: messages[messages.length - 1]?.message || (messages[messages.length - 1]?.attachment ? '[Image]' : ''),
        lastAt: messages[messages.length - 1]?.created_at,
      };
    }).sort((a, b) => {
      if (a.unread !== b.unread) return b.unread - a.unread;
      return new Date(b.lastAt || 0) - new Date(a.lastAt || 0);
    });
  }

  static async getUnreadAdminTotal() {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('sender', 'user')
      .eq('read', false);
    if (error) throw error;
    return count || 0;
  }

  static async getUnreadUserTotal(userId) {
    const { count, error } = await supabase
      .from('chat_messages')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('sender', 'admin')
      .eq('read', false);
    if (error) throw error;
    return count || 0;
  }

  static async markUserRead(userId) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('sender', 'admin')
      .eq('read', false);
    if (error) throw error;
  }

  static async markAdminRead(userId) {
    const { error } = await supabase
      .from('chat_messages')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('sender', 'user')
      .eq('read', false);
    if (error) throw error;
  }
}

module.exports = Chat;