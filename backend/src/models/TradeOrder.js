const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const ORDERS_FILE = path.join(__dirname, '../../data/p2p_orders.json');
const TRADES_FILE = path.join(__dirname, '../../data/trade_history.json');

function ensureDataDir() {
  const dir = path.dirname(ORDERS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '{}');
  if (!fs.existsSync(TRADES_FILE)) fs.writeFileSync(TRADES_FILE, '{}');
}

function loadOrders() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8')); } catch { return {}; }
}

function saveOrders(data) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(data, null, 2));
}

function loadTrades() {
  ensureDataDir();
  try { return JSON.parse(fs.readFileSync(TRADES_FILE, 'utf8')); } catch { return {}; }
}

function saveTrades(data) {
  ensureDataDir();
  fs.writeFileSync(TRADES_FILE, JSON.stringify(data, null, 2));
}

function createOrder({ userId, type, coin, amount, pricePerUnit, paymentMethod, notes }) {
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const all = loadOrders();
  all[id] = order;
  saveOrders(all);
  return order;
}

function getOrder(orderId) {
  const all = loadOrders();
  return all[orderId] || null;
}

function getOpenOrders({ coin, type, excludeUserId, limit = 50 } = {}) {
  const all = loadOrders();
  let orders = Object.values(all).filter(o => o.status === 'open');
  if (coin) orders = orders.filter(o => o.coin === coin);
  if (type) orders = orders.filter(o => o.type === type);
  if (excludeUserId) orders = orders.filter(o => o.user_id !== excludeUserId);
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return orders.slice(0, limit);
}

function getUserOrders(userId, { status, limit = 50 } = {}) {
  const all = loadOrders();
  let orders = Object.values(all).filter(o => o.user_id === userId);
  if (status) orders = orders.filter(o => o.status === status);
  orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return orders.slice(0, limit);
}

function updateOrder(orderId, updates) {
  const all = loadOrders();
  if (!all[orderId]) return null;
  all[orderId] = { ...all[orderId], ...updates, updated_at: new Date().toISOString() };
  saveOrders(all);
  return all[orderId];
}

function cancelOrder(orderId, userId) {
  const all = loadOrders();
  const order = all[orderId];
  if (!order) return { error: 'Order not found' };
  if (order.user_id !== userId) return { error: 'Not your order' };
  if (order.status !== 'open') return { error: 'Order is not open' };
  all[orderId].status = 'cancelled';
  all[orderId].updated_at = new Date().toISOString();
  saveOrders(all);
  return all[orderId];
}

function createTrade({ orderId, buyerId, sellerId, coin, amount, pricePerUnit, totalUsd, paymentMethod }) {
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
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  const all = loadTrades();
  all[id] = trade;
  saveTrades(all);
  return trade;
}

function getTrade(tradeId) {
  const all = loadTrades();
  return all[tradeId] || null;
}

function getUserTrades(userId, { status, limit = 50 } = {}) {
  const all = loadTrades();
  let trades = Object.values(all).filter(t => t.buyer_id === userId || t.seller_id === userId);
  if (status) trades = trades.filter(t => t.status === status);
  trades.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return trades.slice(0, limit);
}

function updateTrade(tradeId, updates) {
  const all = loadTrades();
  if (!all[tradeId]) return null;
  all[tradeId] = { ...all[tradeId], ...updates, updated_at: new Date().toISOString() };
  saveTrades(all);
  return all[tradeId];
}

function addTradeMessage(tradeId, senderId, message) {
  const all = loadTrades();
  const trade = all[tradeId];
  if (!trade) return null;
  trade.messages.push({
    id: uuidv4(),
    sender_id: senderId,
    message,
    created_at: new Date().toISOString(),
  });
  trade.updated_at = new Date().toISOString();
  saveTrades(all);
  return trade;
}

function confirmTrade(tradeId, userId) {
  const all = loadTrades();
  const trade = all[tradeId];
  if (!trade) return { error: 'Trade not found' };
  if (trade.buyer_id !== userId && trade.seller_id !== userId) return { error: 'Not your trade' };
  if (trade.status !== 'escrow') return { error: 'Trade not in escrow' };

  if (trade.buyer_id === userId) trade.buyer_confirmed = true;
  if (trade.seller_id === userId) trade.seller_confirmed = true;
  trade.updated_at = new Date().toISOString();

  if (trade.buyer_confirmed && trade.seller_confirmed) {
    trade.status = 'completed';
  }

  saveTrades(all);
  return trade;
}

function disputeTrade(tradeId, userId, reason) {
  const all = loadTrades();
  const trade = all[tradeId];
  if (!trade) return { error: 'Trade not found' };
  if (trade.buyer_id !== userId && trade.seller_id !== userId) return { error: 'Not your trade' };
  if (trade.status !== 'escrow') return { error: 'Trade not in escrow' };

  trade.status = 'disputed';
  trade.dispute_reason = reason;
  trade.updated_at = new Date().toISOString();
  saveTrades(all);
  return trade;
}

function getOrderBook(coin) {
  const all = loadOrders();
  const openOrders = Object.values(all).filter(o => o.status === 'open' && o.coin === coin);
  const buyOrders = openOrders
    .filter(o => o.type === 'buy')
    .sort((a, b) => b.price_per_unit - a.price_per_unit);
  const sellOrders = openOrders
    .filter(o => o.type === 'sell')
    .sort((a, b) => a.price_per_unit - b.price_per_unit);
  return { buyOrders, sellOrders };
}

function getTradeStats(coin) {
  const all = loadTrades();
  const trades = Object.values(all).filter(t => t.coin === coin && t.status === 'completed');
  if (trades.length === 0) return { totalTrades: 0, totalVolume: 0, avgPrice: 0, high24h: 0, low24h: 0 };

  const totalVolume = trades.reduce((sum, t) => sum + t.total_usd, 0);
  const avgPrice = totalVolume / trades.reduce((sum, t) => sum + t.amount, 0);

  const now = Date.now();
  const oneDayAgo = now - 24 * 60 * 60 * 1000;
  const recentTrades = trades.filter(t => new Date(t.created_at).getTime() > oneDayAgo);
  const high24h = recentTrades.length > 0 ? Math.max(...recentTrades.map(t => t.price_per_unit)) : 0;
  const low24h = recentTrades.length > 0 ? Math.min(...recentTrades.map(t => t.price_per_unit)) : 0;

  return { totalTrades: trades.length, totalVolume, avgPrice: Math.round(avgPrice * 100) / 100, high24h, low24h };
}

module.exports = {
  createOrder, getOrder, getOpenOrders, getUserOrders, updateOrder, cancelOrder,
  createTrade, getTrade, getUserTrades, updateTrade, addTradeMessage,
  confirmTrade, disputeTrade, getOrderBook, getTradeStats,
};
