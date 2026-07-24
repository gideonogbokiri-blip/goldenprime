const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

async function createOrder({ userId, type, coin, amount, pricePerUnit, paymentMethod, notes }) {
  const id = uuidv4();
  const order = {
    id,
    user_id: userId,
    type,
    coin,
    amount: parseFloat(amount),
    price_per_unit: parseFloat(pricePerUnit),
    total_usd: parseFloat(amount) * parseFloat(pricePerUnit),
    payment_method: paymentMethod || 'bank_transfer',
    notes: notes || '',
    status: 'open',
    filled_amount: 0,
  };
  const { data, error } = await supabase.from('p2p_orders').insert(order).select().single();
  if (error) throw error;
  return data;
}

async function getOrder(orderId) {
  const { data, error } = await supabase.from('p2p_orders').select('*').eq('id', orderId).maybeSingle();
  if (error) throw error;
  return data;
}

async function getOpenOrders({ coin, type, excludeUserId, limit = 50 } = {}) {
  let query = supabase.from('p2p_orders').select('*').eq('status', 'open');
  if (coin) query = query.eq('coin', coin);
  if (type) query = query.eq('type', type);
  if (excludeUserId) query = query.neq('user_id', excludeUserId);
  query = query.order('created_at', { ascending: false }).limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getUserOrders(userId, { status, limit = 50 } = {}) {
  let query = supabase.from('p2p_orders').select('*').eq('user_id', userId);
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false }).limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function updateOrder(orderId, updates) {
  const { data, error } = await supabase
    .from('p2p_orders')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function cancelOrder(orderId, userId) {
  const order = await getOrder(orderId);
  if (!order) return { error: 'Order not found' };
  if (order.user_id !== userId) return { error: 'Not your order' };
  if (order.status !== 'open') return { error: 'Order is not open' };
  return updateOrder(orderId, { status: 'cancelled' });
}

async function createTrade({ orderId, buyerId, sellerId, coin, amount, pricePerUnit, totalUsd, paymentMethod }) {
  const id = uuidv4();
  const trade = {
    id,
    order_id: orderId,
    buyer_id: buyerId,
    seller_id: sellerId,
    coin,
    amount: parseFloat(amount),
    price_per_unit: parseFloat(pricePerUnit),
    total_usd: parseFloat(totalUsd),
    payment_method: paymentMethod,
    status: 'escrow',
    buyer_confirmed: false,
    seller_confirmed: false,
    dispute_reason: null,
    messages: [],
  };
  const { data, error } = await supabase.from('p2p_trades').insert(trade).select().single();
  if (error) throw error;
  return data;
}

async function getTrade(tradeId) {
  const { data, error } = await supabase.from('p2p_trades').select('*').eq('id', tradeId).maybeSingle();
  if (error) throw error;
  return data;
}

async function getUserTrades(userId, { status, limit = 50 } = {}) {
  let query = supabase.from('p2p_trades').select('*').or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);
  if (status) query = query.eq('status', status);
  query = query.order('created_at', { ascending: false }).limit(limit);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function updateTrade(tradeId, updates) {
  const { data, error } = await supabase
    .from('p2p_trades')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', tradeId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function addTradeMessage(tradeId, senderId, message) {
  const trade = await getTrade(tradeId);
  if (!trade) return null;
  const messages = trade.messages || [];
  messages.push({
    id: uuidv4(),
    sender_id: senderId,
    message,
    created_at: new Date().toISOString(),
  });
  return updateTrade(tradeId, { messages });
}

async function confirmTrade(tradeId, userId) {
  const trade = await getTrade(tradeId);
  if (!trade) return { error: 'Trade not found' };
  if (trade.buyer_id !== userId && trade.seller_id !== userId) return { error: 'Not your trade' };
  if (trade.status !== 'escrow') return { error: 'Trade not in escrow' };

  const updates = {};
  if (trade.buyer_id === userId) updates.buyer_confirmed = true;
  if (trade.seller_id === userId) updates.seller_confirmed = true;

  const buyerConfirmed = trade.buyer_id === userId ? true : trade.buyer_confirmed;
  const sellerConfirmed = trade.seller_id === userId ? true : trade.seller_confirmed;

  if (buyerConfirmed && sellerConfirmed) {
    updates.status = 'completed';
  }

  return updateTrade(tradeId, updates);
}

async function disputeTrade(tradeId, userId, reason) {
  const trade = await getTrade(tradeId);
  if (!trade) return { error: 'Trade not found' };
  if (trade.buyer_id !== userId && trade.seller_id !== userId) return { error: 'Not your trade' };
  if (trade.status !== 'escrow') return { error: 'Trade not in escrow' };
  return updateTrade(tradeId, { status: 'disputed', dispute_reason: reason });
}

async function getOrderBook(coin) {
  const { data: openOrders, error } = await supabase
    .from('p2p_orders')
    .select('*')
    .eq('status', 'open')
    .eq('coin', coin);
  if (error) throw error;

  const buyOrders = (openOrders || [])
    .filter(o => o.type === 'buy')
    .sort((a, b) => b.price_per_unit - a.price_per_unit);
  const sellOrders = (openOrders || [])
    .filter(o => o.type === 'sell')
    .sort((a, b) => a.price_per_unit - b.price_per_unit);
  return { buyOrders, sellOrders };
}

async function getTradeStats(coin) {
  const { data: trades, error } = await supabase
    .from('p2p_trades')
    .select('*')
    .eq('coin', coin)
    .eq('status', 'completed');
  if (error) throw error;

  if (!trades || trades.length === 0) return { totalTrades: 0, totalVolume: 0, avgPrice: 0, high24h: 0, low24h: 0 };

  const totalVolume = trades.reduce((sum, t) => sum + parseFloat(t.total_usd), 0);
  const totalAmount = trades.reduce((sum, t) => sum + parseFloat(t.amount), 0);
  const avgPrice = totalVolume / totalAmount;

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const recentTrades = trades.filter(t => new Date(t.created_at).getTime() > oneDayAgo);
  const high24h = recentTrades.length > 0 ? Math.max(...recentTrades.map(t => parseFloat(t.price_per_unit))) : 0;
  const low24h = recentTrades.length > 0 ? Math.min(...recentTrades.map(t => parseFloat(t.price_per_unit))) : 0;

  return { totalTrades: trades.length, totalVolume, avgPrice: Math.round(avgPrice * 100) / 100, high24h, low24h };
}

module.exports = {
  createOrder, getOrder, getOpenOrders, getUserOrders, updateOrder, cancelOrder,
  createTrade, getTrade, getUserTrades, updateTrade, addTradeMessage,
  confirmTrade, disputeTrade, getOrderBook, getTradeStats,
};
