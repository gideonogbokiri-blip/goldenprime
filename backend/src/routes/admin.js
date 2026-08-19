const express = require('express');
const adminOnly = require('../middleware/admin');
const adminController = require('../controllers/adminController');

const router = express.Router();

router.get('/dashboard', adminOnly, adminController.dashboard);
router.get('/users', adminOnly, adminController.getUsers);
router.put('/users/:id/role', adminOnly, adminController.updateUserRole);
router.get('/transactions', adminOnly, adminController.getTransactions);
router.put('/transactions/:id/status', adminOnly, adminController.updateTransactionStatus);
router.get('/kyc', adminOnly, adminController.getKYCRequests);
router.put('/kyc/:id/approve', adminOnly, adminController.approveKYC);
router.put('/kyc/:id/reject', adminOnly, adminController.rejectKYC);
router.get('/logs', adminOnly, adminController.getLogs);
router.get('/deposits', adminOnly, adminController.getAllDeposits);
router.get('/deposits/pending', adminOnly, adminController.getPendingDeposits);
router.put('/deposits/:id/approve', adminOnly, adminController.approveDeposit);
router.put('/deposits/:id/reject', adminOnly, adminController.rejectDeposit);
router.get('/preorders', adminOnly, adminController.getAllPreorders);
router.put('/preorders/:id/approve', adminOnly, adminController.approvePreorder);
router.put('/preorders/:id/reject', adminOnly, adminController.rejectPreorder);
router.get('/user/:userId/payment-details', adminOnly, adminController.getUserBankDetails);
router.post('/users/:userId/fund', adminOnly, adminController.fundWallet);
router.get('/withdrawals', adminOnly, adminController.getWithdrawals);
router.put('/withdrawals/:id/approve', adminOnly, adminController.approveWithdrawal);
router.put('/withdrawals/:id/reject', adminOnly, adminController.rejectWithdrawal);
router.get('/settings', adminOnly, adminController.getSettings);
router.put('/settings', adminOnly, adminController.saveSettings);
router.get('/chat/threads', adminOnly, adminController.getChatThreads);
router.get('/chat/users/:userId/messages', adminOnly, adminController.getChatConversation);
router.post('/chat/users/:userId/messages', adminOnly, adminController.adminReply);

module.exports = router;
