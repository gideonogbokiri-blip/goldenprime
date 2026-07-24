const tradingService = require('../services/tradingService');

async function buy(req, res, next) {
  try {
    const { coinId, amount } = req.body;
    if (!coinId || !amount) {
      return res.status(400).json({ error: 'coinId and amount required' });
    }
    const result = await tradingService.buyCrypto(req.user.id, coinId, amount);
    res.json({ message: 'Purchase successful', ...result });
  } catch (err) {
    next(err);
  }
}

async function sell(req, res, next) {
  try {
    const { coinId, amount } = req.body;
    if (!coinId || !amount) {
      return res.status(400).json({ error: 'coinId and amount required' });
    }
    const result = await tradingService.sellCrypto(req.user.id, coinId, amount);
    res.json({ message: 'Sale successful', ...result });
  } catch (err) {
    next(err);
  }
}

async function getPortfolio(req, res, next) {
  try {
    const portfolio = await tradingService.getPortfolio(req.user.id);
    res.json(portfolio);
  } catch (err) {
    next(err);
  }
}

module.exports = { buy, sell, getPortfolio };
