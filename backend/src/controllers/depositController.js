const depositService = require('../services/depositService');

async function requestDeposit(req, res, next) {
  try {
    const { amount, method, referenceCode } = req.body;
    const result = await depositService.requestDeposit(req.user.id, { amount, method, referenceCode });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

async function getMyDeposits(req, res, next) {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const deposits = await depositService.getMyDeposits(req.user.id, { limit, offset });
    res.json({ deposits });
  } catch (err) {
    next(err);
  }
}

async function getInstructions(req, res, next) {
  try {
    const instructions = depositService.getPaymentInstructions();
    res.json(instructions);
  } catch (err) {
    next(err);
  }
}

module.exports = { requestDeposit, getMyDeposits, getInstructions };
