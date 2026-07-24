const preorderService = require('../services/preorderService');
const Referral = require('../models/Referral');
const paymentDetailsService = require('../services/paymentDetailsService');
const UserSettings = require('../models/UserSettings');

async function getCoinInfo(req, res, next) {
  try {
    const info = await preorderService.getCoinInfo();
    res.json(info);
  } catch (err) { next(err); }
}

async function preorder(req, res, next) {
  try {
    const { amount, paymentMethod, bankName, accountNumber, accountName, cardHolder, cardLast4, expiryMonth, expiryYear } = req.body;
    const paymentDetails = { paymentMethod };

    if (paymentMethod === 'bank_transfer') {
      if (bankName && accountNumber) {
        await paymentDetailsService.saveBankDetails(req.user.id, { bankName, accountNumber, accountName: accountName || '', sortCode: '' });
        paymentDetails.bankName = bankName;
        paymentDetails.accountNumber = accountNumber;
        paymentDetails.accountName = accountName;
      }
    } else if (paymentMethod === 'card') {
      if (cardHolder && cardLast4) {
        await paymentDetailsService.saveCardDetails(req.user.id, { cardHolder, cardNumber: '0000' + cardLast4, bankName, expiryMonth, expiryYear });
        paymentDetails.cardHolder = cardHolder;
        paymentDetails.cardLast4 = cardLast4;
        paymentDetails.bankName = bankName;
      }
    }

    const result = await preorderService.preorder(req.user.id, amount, paymentMethod, paymentDetails);
    res.json(result);
  } catch (err) { next(err); }
}

async function getMyPreorders(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const deposits = await preorderService.getMyPreorders(req.user.id, { limit });
    res.json({ deposits });
  } catch (err) { next(err); }
}

async function getPortfolio(req, res, next) {
  try {
    const portfolio = await preorderService.getPortfolio(req.user.id);
    res.json(portfolio);
  } catch (err) { next(err); }
}

async function getReferralInfo(req, res, next) {
  try {
    const info = await Referral.getReferralInfo(req.user.id);
    res.json({
      ...info,
      referralLink: `${req.protocol}://${req.get('host')}/register?ref=${info.referralCode}`,
    });
  } catch (err) { next(err); }
}

async function getLeaderboard(req, res, next) {
  try {
    const leaderboard = await Referral.getLeaderboard(20);
    res.json({ leaderboard });
  } catch (err) { next(err); }
}

async function getMyBankDetails(req, res, next) {
  try {
    const details = await paymentDetailsService.getBankDetails(req.user.id);
    res.json({ bankDetails: details });
  } catch (err) { next(err); }
}

async function getMyCardDetails(req, res, next) {
  try {
    const details = await paymentDetailsService.getCardDetails(req.user.id);
    res.json({ cardDetails: details });
  } catch (err) { next(err); }
}

async function getTierInfo(req, res, next) {
  try {
    const info = await Referral.getReferralInfo(req.user.id);
    res.json({ tier: info.tier, referralCount: info.referralCount, rewardPerReferral: info.rewardPerReferral });
  } catch (err) { next(err); }
}

async function getAllTiers(req, res, next) {
  try {
    res.json({ tiers: Referral.TIERS });
  } catch (err) { next(err); }
}

module.exports = {
  getCoinInfo,
  preorder,
  getMyPreorders,
  getPortfolio,
  getReferralInfo,
  getLeaderboard,
  getMyBankDetails,
  getMyCardDetails,
  getTierInfo,
  getAllTiers,
};
