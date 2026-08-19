const Setting = require('../models/Setting');

async function getPublicSettings(req, res, next) {
  try {
    const [rate, minDeposit, maxDeposit, bankDetails, cryptoWallet] = await Promise.all([
      Setting.get('expected_profit_rate', 3),
      Setting.get('min_deposit', 10),
      Setting.get('max_deposit', 50000),
      Setting.get('bank_details', {}),
      Setting.get('crypto_wallet', {}),
    ]);
    res.json({
      expectedProfitRate: Number(rate) || 0,
      minDeposit: Number(minDeposit) || 10,
      maxDeposit: Number(maxDeposit) || 50000,
      bankDetails,
      cryptoWallet,
    });
  } catch (err) { next(err); }
}

module.exports = { getPublicSettings };