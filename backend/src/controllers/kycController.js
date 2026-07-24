const kycService = require('../services/kycService');

async function submit(req, res, next) {
  try {
    const { fullName, dateOfBirth, country, documentType, documentNumber } = req.body;
    if (!fullName || !dateOfBirth || !country || !documentType || !documentNumber) {
      return res.status(400).json({ error: 'All fields required' });
    }
    const kyc = await kycService.submitKYC(req.user.id, req.body);
    res.json({ message: 'KYC submitted for review', kyc });
  } catch (err) {
    next(err);
  }
}

async function getStatus(req, res, next) {
  try {
    const kyc = await kycService.getKYCStatus(req.user.id);
    res.json({ kyc });
  } catch (err) {
    next(err);
  }
}

module.exports = { submit, getStatus };
