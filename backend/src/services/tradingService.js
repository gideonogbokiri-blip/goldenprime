const Wallet = require('../models/Wallet');
const Transaction = require('../models/Transaction');
const cryptoService = require('./cryptoService');

async function buyCrypto(userId, coinId, usdAmount) {
  if (usdAmount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });

  const usdBalance = await Wallet.getBalance(userId, 'USD');
  if (usdBalance < usdAmount) {
    throw Object.assign(new Error('Insufficient USD balance. Deposit funds first.'), { status: 400 });
  }

  const prices = await cryptoService.getPrices();
  const coin = prices.find((c) => c.id === coinId);
  if (!coin) throw Object.assign(new Error('Unsupported cryptocurrency'), { status: 400 });
  if (!coin.price || coin.price <= 0) throw Object.assign(new Error('Price unavailable for this coin'), { status: 400 });

  const cryptoAmount = usdAmount / coin.price;

  await Wallet.updateBalance(userId, 'USD', -usdAmount);
  await Wallet.updateBalance(userId, coin.symbol, cryptoAmount);

  const tx = await Transaction.create({
    userId,
    type: 'buy',
    currency: coin.symbol,
    amount: cryptoAmount,
    usdValue: usdAmount,
    status: 'completed',
    metadata: { coinId, coinName: coin.name, priceAtPurchase: coin.price },
  });

  return {
    transaction: tx,
    coin: coin.name,
    symbol: coin.symbol,
    cryptoAmount,
    usdSpent: usdAmount,
    priceAtPurchase: coin.price,
  };
}

async function sellCrypto(userId, coinId, cryptoAmount) {
  if (cryptoAmount <= 0) throw Object.assign(new Error('Invalid amount'), { status: 400 });

  const prices = await cryptoService.getPrices();
  const coin = prices.find((c) => c.id === coinId);
  if (!coin) throw Object.assign(new Error('Unsupported cryptocurrency'), { status: 400 });
  if (!coin.price || coin.price <= 0) throw Object.assign(new Error('Price unavailable for this coin'), { status: 400 });

  const held = await Wallet.getBalance(userId, coin.symbol);
  if (held < cryptoAmount) {
    throw Object.assign(new Error(`Insufficient ${coin.symbol} balance`), { status: 400 });
  }

  const usdValue = cryptoAmount * coin.price;

  await Wallet.updateBalance(userId, coin.symbol, -cryptoAmount);
  await Wallet.updateBalance(userId, 'USD', usdValue);

  const tx = await Transaction.create({
    userId,
    type: 'sell',
    currency: coin.symbol,
    amount: cryptoAmount,
    usdValue,
    status: 'completed',
    metadata: { coinId, coinName: coin.name, priceAtSale: coin.price },
  });

  return {
    transaction: tx,
    coin: coin.name,
    symbol: coin.symbol,
    cryptoAmount,
    usdReceived: usdValue,
    priceAtSale: coin.price,
  };
}

async function getPortfolio(userId) {
  const wallets = await Wallet.getAll(userId);
  const prices = await cryptoService.getPrices();

  const holdings = wallets
    .filter((w) => parseFloat(w.balance) > 0)
    .map((w) => {
      const priceData = prices.find((p) => p.symbol === w.currency);
      const balance = parseFloat(w.balance);
      const currentPrice = priceData ? priceData.price : (w.currency === 'USD' ? 1 : 0);
      const value = balance * currentPrice;

      return {
        currency: w.currency,
        balance,
        currentPrice,
        value,
        change24h: priceData ? priceData.change24h : 0,
        name: priceData ? priceData.name : w.currency,
      };
    });

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);

  return { holdings, totalValue };
}

module.exports = { buyCrypto, sellCrypto, getPortfolio };
