const express = require('express');
const authenticate = require('../middleware/auth');
const walletController = require('../controllers/walletController');

const router = express.Router();

/**
 * @swagger
 * /wallet:
 *   get:
 *     tags: [Wallet]
 *     summary: Get all wallets for current user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of wallets with balances
 */
router.get('/', authenticate, walletController.getWallets);

/**
 * @swagger
 * /wallet/transactions:
 *   get:
 *     tags: [Wallet]
 *     summary: Get transaction history
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: List of transactions
 */
router.get('/transactions', authenticate, walletController.getTransactions);

/**
 * @swagger
 * /wallet/deposit:
 *   post:
 *     tags: [Wallet]
 *     summary: Request a USD deposit
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [bank_transfer, card]
 *     responses:
 *       201:
 *         description: Deposit request created
 */
router.post('/deposit', authenticate, walletController.createDeposit);

/**
 * @swagger
 * /wallet/withdraw:
 *   post:
 *     tags: [Wallet]
 *     summary: Request a withdrawal
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Withdrawal request created
 */
router.post('/withdraw', authenticate, walletController.createWithdraw);

/**
 * @swagger
 * /wallet/dev-deposit:
 *   post:
 *     tags: [Wallet]
 *     summary: Dev-only: simulate a deposit (no auth required in dev)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount]
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Deposit simulated
 */
router.post('/dev-deposit', authenticate, walletController.devDeposit);

module.exports = router;
