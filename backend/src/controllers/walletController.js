const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const paymentService = require('../services/paymentService');

async function getWallets(req, res, next) {
  try {
    const wallets = await Wallet.getAll(req.user.id);
    res.json({ wallets });
  } catch (err) {
    next(err);
  }
}

async function getTransactions(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;
    const transactions = await Transaction.findByUser(req.user.id, { limit, offset });
    res.json({ transactions });
  } catch (err) {
    next(err);
  }
}

async function createDeposit(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    if (amount < 10) {
      return res.status(400).json({ error: 'Minimum deposit is $10' });
    }
    if (amount > 10000) {
      return res.status(400).json({ error: 'Maximum deposit is $10,000' });
    }

    const result = await paymentService.createDepositIntent(req.user.id, amount);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function createWithdraw(req, res, next) {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const tx = await paymentService.createWithdrawRequest(req.user.id, amount);
    res.json({ message: 'Withdrawal requested', transaction: tx });
  } catch (err) {
    next(err);
  }
}

async function webhook(req, res, next) {
  try {
    const event = req.body;
    const result = await paymentService.handleWebhook(event);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function devDeposit(req, res, next) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ error: 'Only available in development' });
    }
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    const Wallet = require('../models/Wallet');
    const Transaction = require('../models/Transaction');
    await Wallet.updateBalance(req.user.id, 'USD', amount);
    const tx = await Transaction.create({
      userId: req.user.id,
      type: 'deposit',
      currency: 'USD',
      amount,
      usdValue: amount,
      status: 'completed',
      metadata: { method: 'dev_deposit' },
    });
    res.json({ message: `Deposited $${amount}`, transaction: tx });
  } catch (err) {
    next(err);
  }
}

module.exports = { getWallets, getTransactions, createDeposit, createWithdraw, webhook, devDeposit };
