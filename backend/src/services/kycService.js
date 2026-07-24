const KYC = require('../models/KYC');

async function submitKYC(userId, data) {
  const existing = await KYC.findByUserId(userId);
  if (existing && existing.status === 'pending') {
    throw Object.assign(new Error('KYC verification already pending'), { status: 400 });
  }
  if (existing && existing.status === 'approved') {
    throw Object.assign(new Error('KYC already approved'), { status: 400 });
  }

  const kyc = await KYC.create({
    userId,
    fullName: data.fullName,
    dateOfBirth: data.dateOfBirth,
    country: data.country,
    documentType: data.documentType,
    documentNumber: data.documentNumber,
  });

  return kyc;
}

async function getKYCStatus(userId) {
  const kyc = await KYC.findByUserId(userId);
  return kyc;
}

async function approveKYC(kycId, adminId) {
  const kyc = await KYC.updateStatus(kycId, 'approved', adminId);

  const supabase = require('../config/supabase');
  await supabase.from('users').update({ is_verified: true }).eq('id', kyc.user_id);

  return kyc;
}

async function rejectKYC(kycId, adminId, reason) {
  const kyc = await KYC.updateStatus(kycId, 'rejected', adminId, reason);
  return kyc;
}

module.exports = { submitKYC, getKYCStatus, approveKYC, rejectKYC };
