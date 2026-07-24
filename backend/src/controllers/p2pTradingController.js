const p2pService = require('../services/p2pTradingService');

async function createOrder(req, res, next) {
  try {
    const { type, coin, amount, pricePerUnit, paymentMethod, notes } = req.body;
    if (!type || !coin || !amount || !pricePerUnit) {
      return res.status(400).json({ error: 'type, coin, amount, and pricePerUnit are required' });
    }
    const order = await p2pService.createOrder(req.user.id, { type, coin, amount, pricePerUnit, paymentMethod, notes });
    res.status(201).json(order);
  } catch (err) { next(err); }
}

async function cancelOrder(req, res, next) {
  try {
    const result = await p2pService.cancelOrder(req.params.id, req.user.id);
    res.json(result);
  } catch (err) { next(err); }
}

async function takeOrder(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount) return res.status(400).json({ error: 'amount is required' });
    const trade = await p2pService.takeOrder(req.user.id, req.params.id, amount);
    res.json({ message: 'Trade initiated', trade });
  } catch (err) { next(err); }
}

async function confirmTrade(req, res, next) {
  try {
    const result = await p2pService.confirmTrade(req.params.id, req.user.id);
    res.json({ message: result.status === 'completed' ? 'Trade completed' : 'Confirmation recorded', trade: result });
  } catch (err) { next(err); }
}

async function disputeTrade(req, res, next) {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'reason is required' });
    const result = await p2pService.disputeTrade(req.params.id, req.user.id, reason);
    res.json({ message: 'Trade disputed', trade: result });
  } catch (err) { next(err); }
}

async function sendMessage(req, res, next) {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message is required' });
    const trade = await p2pService.sendMessage(req.params.id, req.user.id, message);
    res.json(trade);
  } catch (err) { next(err); }
}

async function getOrderBook(req, res, next) {
  try {
    const coin = req.params.coin || 'GPG';
    const book = await p2pService.getOrderBook(coin);
    res.json(book);
  } catch (err) { next(err); }
}

async function getMyOrders(req, res, next) {
  try {
    const orders = await p2pService.getUserOrders(req.user.id, { status: req.query.status });
    res.json(orders);
  } catch (err) { next(err); }
}

async function getMyTrades(req, res, next) {
  try {
    const trades = await p2pService.getUserTrades(req.user.id, { status: req.query.status });
    res.json(trades);
  } catch (err) { next(err); }
}

async function getTrade(req, res, next) {
  try {
    const trade = await p2pService.getTrade(req.params.id, req.user.id);
    res.json(trade);
  } catch (err) { next(err); }
}

module.exports = {
  createOrder, cancelOrder, takeOrder, confirmTrade, disputeTrade,
  sendMessage, getOrderBook, getMyOrders, getMyTrades, getTrade,
};
