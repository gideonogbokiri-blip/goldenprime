const adminService = require('../services/adminService');
const depositService = require('../services/depositService');
const preorderService = require('../services/preorderService');
const paymentDetailsService = require('../services/paymentDetailsService');

async function dashboard(req, res, next) {
  try {
    const stats = await adminService.getDashboard();
    res.json(stats);
  } catch (err) { next(err); }
}

async function getUsers(req, res, next) {
  try {
    const users = await adminService.getUsers({ search: req.query.search });
    res.json({ users });
  } catch (err) { next(err); }
}

async function updateUserRole(req, res, next) {
  try {
    const { role } = req.body;
    const { id } = req.params;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    const user = await adminService.updateUserRole(id, role, req.user.id);
    res.json({ user });
  } catch (err) { next(err); }
}

async function getTransactions(req, res, next) {
  try {
    const txs = await adminService.getTransactions({ status: req.query.status, type: req.query.type });
    res.json({ transactions: txs });
  } catch (err) { next(err); }
}

async function updateTransactionStatus(req, res, next) {
  try {
    const { status } = req.body;
    const tx = await adminService.updateTransactionStatus(req.params.id, status, req.user.id);
    res.json({ transaction: tx });
  } catch (err) { next(err); }
}

async function getKYCRequests(req, res, next) {
  try {
    const kycList = await adminService.getKYCRequests({ status: req.query.status });
    res.json({ kyc: kycList });
  } catch (err) { next(err); }
}

async function approveKYC(req, res, next) {
  try {
    const kyc = await adminService.approveKYC(req.params.id, req.user.id);
    res.json({ message: 'KYC approved', kyc });
  } catch (err) { next(err); }
}

async function rejectKYC(req, res, next) {
  try {
    const { reason } = req.body;
    const kyc = await adminService.rejectKYC(req.params.id, req.user.id, reason);
    res.json({ message: 'KYC rejected', kyc });
  } catch (err) { next(err); }
}

async function getLogs(req, res, next) {
  try {
    const logs = await adminService.getLogs();
    res.json({ logs });
  } catch (err) { next(err); }
}

async function getPendingDeposits(req, res, next) {
  try {
    const deposits = await depositService.getPendingDeposits();
    res.json({ deposits });
  } catch (err) { next(err); }
}

async function getAllDeposits(req, res, next) {
  try {
    const deposits = await depositService.getAllDeposits({ status: req.query.status });
    res.json({ deposits });
  } catch (err) { next(err); }
}

async function approveDeposit(req, res, next) {
  try {
    const { notes } = req.body || {};
    const deposit = await depositService.approveDeposit(req.params.id, req.user.id, notes);
    const AdminLog = require('../models/AdminLog');
    await AdminLog.create({
      adminId: req.user.id,
      action: 'approve_deposit',
      targetType: 'transaction',
      targetId: req.params.id,
      details: { amount: deposit.amount, notes },
    });
    res.json({ message: 'Deposit approved', deposit });
  } catch (err) { next(err); }
}

async function rejectDeposit(req, res, next) {
  try {
    const { reason } = req.body || {};
    const deposit = await depositService.rejectDeposit(req.params.id, req.user.id, reason);
    const AdminLog = require('../models/AdminLog');
    await AdminLog.create({
      adminId: req.user.id,
      action: 'reject_deposit',
      targetType: 'transaction',
      targetId: req.params.id,
      details: { amount: deposit.amount, reason },
    });
    res.json({ message: 'Deposit rejected', deposit });
  } catch (err) { next(err); }
}

async function getAllPreorders(req, res, next) {
  try {
    const preorders = await preorderService.getAllPreorders({ status: req.query.status });
    res.json({ preorders });
  } catch (err) { next(err); }
}

async function approvePreorder(req, res, next) {
  try {
    const { notes } = req.body || {};
    const preorder = await preorderService.approvePreorder(req.params.id, req.user.id, notes);
    const AdminLog = require('../models/AdminLog');
    await AdminLog.create({
      adminId: req.user.id,
      action: 'approve_preorder',
      targetType: 'transaction',
      targetId: req.params.id,
      details: { gpgAmount: preorder.amount, notes },
    });
    res.json({ message: 'Preorder approved', preorder });
  } catch (err) { next(err); }
}

async function rejectPreorder(req, res, next) {
  try {
    const { reason } = req.body || {};
    const preorder = await preorderService.rejectPreorder(req.params.id, req.user.id, reason);
    const AdminLog = require('../models/AdminLog');
    await AdminLog.create({
      adminId: req.user.id,
      action: 'reject_preorder',
      targetType: 'transaction',
      targetId: req.params.id,
      details: { reason },
    });
    res.json({ message: 'Preorder rejected', preorder });
  } catch (err) { next(err); }
}

async function getUserBankDetails(req, res, next) {
  try {
    const details = await paymentDetailsService.getBankDetails(req.params.userId);
    const card = await paymentDetailsService.getCardDetails(req.params.userId);
    res.json({ bankDetails: details, cardDetails: card });
  } catch (err) { next(err); }
}

module.exports = {
  dashboard, getUsers, updateUserRole,
  getTransactions, updateTransactionStatus,
  getKYCRequests, approveKYC, rejectKYC,
  getLogs, getPendingDeposits, getAllDeposits, approveDeposit, rejectDeposit,
  getAllPreorders, approvePreorder, rejectPreorder, getUserBankDetails,
};
