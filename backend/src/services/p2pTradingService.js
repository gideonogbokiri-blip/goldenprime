const TradeOrder = require('../models/TradeOrder');
const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const cryptoService = require('./cryptoService');

const SUPPORTED_COINS = ['BTC', 'ETH', 'SOL', 'USDT', 'USDC', 'GPG'];

async function createOrder(userId, { type, coin, amount, pricePerUnit, paymentMethod, notes }) {
  if (!['buy', 'sell'].includes(type)) throw Object.assign(new Error('Type must be buy or sell'), { status: 400 });
  if (!SUPPORTED_COINS.includes(coin)) throw Object.assign(new Error('Unsupported coin'), { status: 400 });
  if (!amount || amount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });
  if (!pricePerUnit || pricePerUnit <= 0) throw Object.assign(new Error('Invalid price'), { status: 400 });

  const totalUsd = parseFloat(amount) * parseFloat(pricePerUnit);

  if (type === 'sell') {
    const balance = await Wallet.getBalance(userId, coin);
    if (balance < parseFloat(amount)) {
      throw Object.assign(new Error(`Insufficient ${coin} balance. You have ${balance} ${coin}`), { status: 400 });
    }
    const cryptoAmount = parseFloat(amount);
    await Wallet.updateBalance(userId, coin, -cryptoAmount);

    await Transaction.create({
      userId,
      type: 'escrow_lock',
      currency: coin,
      amount: cryptoAmount,
      usdValue: totalUsd,
      status: 'completed',
      metadata: { source: 'p2p_order', coin, locked: true },
    });
  } else {
    // Buy orders must lock the buyer's USD up front so the seller can be
    // paid from escrow when the trade completes. Without this, the seller
    // is credited USD out of thin air and the buyer receives coins free.
    const usdBalance = await Wallet.getBalance(userId, 'USD');
    if (usdBalance < totalUsd) {
      throw Object.assign(new Error(`Insufficient USD balance. Need $${totalUsd.toFixed(2)}`), { status: 400 });
    }
    await Wallet.updateBalance(userId, 'USD', -totalUsd);

    await Transaction.create({
      userId,
      type: 'escrow_lock',
      currency: 'USD',
      amount: totalUsd,
      usdValue: totalUsd,
      status: 'completed',
      metadata: { source: 'p2p_order', coin, locked: true },
    });
  }

  const order = TradeOrder.createOrder({
    userId,
    type,
    coin,
    amount,
    pricePerUnit,
    paymentMethod,
    notes,
  });

  return order;
}

async function cancelOrder(orderId, userId) {
  const result = TradeOrder.cancelOrder(orderId, userId);
  if (result.error) throw Object.assign(new Error(result.error), { status: 400 });

  // result.amount is the remaining (unfilled) order amount after partial fills
  const remainingUsd = parseFloat(result.amount) * parseFloat(result.price_per_unit);

  if (result.type === 'sell') {
    await Wallet.updateBalance(userId, result.coin, result.amount);
    await Transaction.create({
      userId,
      type: 'escrow_unlock',
      currency: result.coin,
      amount: result.amount,
      usdValue: remainingUsd,
      status: 'completed',
      metadata: { source: 'p2p_cancel', coin: result.coin },
    });
  } else {
    // Refund the USD that was locked in escrow for the unfilled portion
    await Wallet.updateBalance(userId, 'USD', remainingUsd);
    await Transaction.create({
      userId,
      type: 'escrow_unlock',
      currency: 'USD',
      amount: remainingUsd,
      usdValue: remainingUsd,
      status: 'completed',
      metadata: { source: 'p2p_cancel', coin: result.coin },
    });
  }

  return result;
}

async function takeOrder(takerId, orderId, amount) {
  const order = TradeOrder.getOrder(orderId);
  if (!order) throw Object.assign(new Error('Order not found'), { status: 404 });
  if (order.status !== 'open') throw Object.assign(new Error('Order is no longer open'), { status: 400 });
  if (order.user_id === takerId) throw Object.assign(new Error('Cannot take your own order'), { status: 400 });

  const takeAmount = parseFloat(amount);
  if (takeAmount <= 0 || takeAmount > order.amount) {
    throw Object.assign(new Error(`Amount must be between 0 and ${order.amount}`), { status: 400 });
  }

  const totalUsd = takeAmount * order.price_per_unit;

  if (order.type === 'sell') {
    const usdBalance = await Wallet.getBalance(takerId, 'USD');
    if (usdBalance < totalUsd) {
      throw Object.assign(new Error(`Insufficient USD balance. Need $${totalUsd.toFixed(2)}`), { status: 400 });
    }
    await Wallet.updateBalance(takerId, 'USD', -totalUsd);

    const trade = TradeOrder.createTrade({
      orderId,
      buyerId: takerId,
      sellerId: order.user_id,
      coin: order.coin,
      amount: takeAmount,
      pricePerUnit: order.price_per_unit,
      totalUsd,
      paymentMethod: order.payment_method,
    });

    if (takeAmount >= order.amount) {
      TradeOrder.updateOrder(orderId, { status: 'filled', filled_amount: order.amount });
    } else {
      TradeOrder.updateOrder(orderId, { amount: order.amount - takeAmount, filled_amount: order.filled_amount + takeAmount });
    }

    await Transaction.create({
      userId: takerId,
      type: 'escrow_lock',
      currency: 'USD',
      amount: totalUsd,
      status: 'completed',
      metadata: { source: 'p2p_trade', tradeId: trade.id, coin: order.coin },
    });

    return trade;
  } else {
    const balance = await Wallet.getBalance(takerId, order.coin);
    if (balance < takeAmount) {
      throw Object.assign(new Error(`Insufficient ${order.coin} balance`), { status: 400 });
    }
    await Wallet.updateBalance(takerId, order.coin, -takeAmount);

    const trade = TradeOrder.createTrade({
      orderId,
      buyerId: order.user_id,
      sellerId: takerId,
      coin: order.coin,
      amount: takeAmount,
      pricePerUnit: order.price_per_unit,
      totalUsd,
      paymentMethod: order.payment_method,
    });

    if (takeAmount >= order.amount) {
      TradeOrder.updateOrder(orderId, { status: 'filled', filled_amount: order.amount });
    } else {
      TradeOrder.updateOrder(orderId, { amount: order.amount - takeAmount, filled_amount: order.filled_amount + takeAmount });
    }

    await Transaction.create({
      userId: takerId,
      type: 'escrow_lock',
      currency: order.coin,
      amount: takeAmount,
      usdValue: totalUsd,
      status: 'completed',
      metadata: { source: 'p2p_trade', tradeId: trade.id, coin: order.coin },
    });

    return trade;
  }
}

async function confirmTrade(tradeId, userId) {
  const result = TradeOrder.confirmTrade(tradeId, userId);
  if (result.error) throw Object.assign(new Error(result.error), { status: 400 });

  if (result.status === 'completed') {
    if (result.payment_method === 'bank_transfer' || result.payment_method === 'card') {
      await Wallet.updateBalance(result.seller_id, 'USD', result.total_usd);

      await Transaction.create({
        userId: result.seller_id,
        type: 'escrow_release',
        currency: 'USD',
        amount: result.total_usd,
        status: 'completed',
        metadata: { source: 'p2p_complete', tradeId: result.id, coin: result.coin },
      });

      await Wallet.updateBalance(result.buyer_id, result.coin, result.amount);

      await Transaction.create({
        userId: result.buyer_id,
        type: 'crypto_received',
        currency: result.coin,
        amount: result.amount,
        usdValue: result.total_usd,
        status: 'completed',
        metadata: { source: 'p2p_complete', tradeId: result.id },
      });
    }
  }

  return result;
}

async function disputeTrade(tradeId, userId, reason) {
  const result = TradeOrder.disputeTrade(tradeId, userId, reason);
  if (result.error) throw Object.assign(new Error(result.error), { status: 400 });
  return result;
}

async function sendMessage(tradeId, senderId, message) {
  const trade = TradeOrder.getTrade(tradeId);
  if (!trade) throw Object.assign(new Error('Trade not found'), { status: 404 });
  if (trade.buyer_id !== senderId && trade.seller_id !== senderId) {
    throw Object.assign(new Error('Not your trade'), { status: 403 });
  }
  return TradeOrder.addTradeMessage(tradeId, senderId, message);
}

async function getOrderBook(coin) {
  const book = TradeOrder.getOrderBook(coin);
  const stats = TradeOrder.getTradeStats(coin);
  let marketPrice = 0;
  if (coin === 'GPG') {
    marketPrice = 50;
  } else {
    try {
      const prices = await cryptoService.getPrices();
      const coinData = prices.find(c => c.symbol === coin);
      marketPrice = coinData ? coinData.price : 0;
    } catch {}
  }
  return { ...book, stats, marketPrice };
}

async function getUserOrders(userId, options) {
  return TradeOrder.getUserOrders(userId, options);
}

async function getUserTrades(userId, options) {
  return TradeOrder.getUserTrades(userId, options);
}

async function getTrade(tradeId, userId) {
  const trade = TradeOrder.getTrade(tradeId);
  if (!trade) throw Object.assign(new Error('Trade not found'), { status: 404 });
  if (trade.buyer_id !== userId && trade.seller_id !== userId) {
    throw Object.assign(new Error('Not your trade'), { status: 403 });
  }
  return trade;
}

module.exports = {
  createOrder, cancelOrder, takeOrder, confirmTrade, disputeTrade,
  sendMessage, getOrderBook, getUserOrders, getUserTrades, getTrade,
};
