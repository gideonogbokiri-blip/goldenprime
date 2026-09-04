const Setting = require('../models/Setting');

async function getPublicSettings(req, res, next) {
  try {
    const [rate, minDeposit, maxDeposit, bankDetails, cryptoWallet, btcWallet, ethWallet, usdtWallet, walletNetwork] = await Promise.all([
      Setting.get('expected_profit_rate', 3),
      Setting.get('min_deposit', 500),
      Setting.get('max_deposit', 50000),
      Setting.get('bank_details', {}),
      Setting.get('crypto_wallet', {}),
      Setting.get('btc_wallet', null),
      Setting.get('eth_wallet', null),
      Setting.get('usdt_wallet', null),
      Setting.get('wallet_network', 'Ethereum (ERC-20)'),
    ]);
    res.json({
      expectedProfitRate: Number(rate) || 0,
      minDeposit: Number(minDeposit) || 500,
      maxDeposit: Number(maxDeposit) || 50000,
      bankDetails,
      cryptoWallet,
      btcWallet,
      ethWallet,
      usdtWallet,
      walletNetwork,
    });
  } catch (err) { next(err); }
}

module.exports = { getPublicSettings };