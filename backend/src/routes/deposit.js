const express = require('express');
const authenticate = require('../middleware/auth');
const requireVerified = require('../middleware/requireVerified');
const depositController = require('../controllers/depositController');

const router = express.Router();

/**
 * @swagger
 * /deposits/request:
 *   post:
 *     tags: [Deposits]
 *     summary: Request a USD deposit via bank transfer
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
router.post('/request', authenticate, requireVerified, depositController.requestDeposit);

/**
 * @swagger
 * /deposits/my:
 *   get:
 *     tags: [Deposits]
 *     summary: Get current user's deposit history
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user deposits
 */
router.get('/my', authenticate, requireVerified, depositController.getMyDeposits);

/**
 * @swagger
 * /deposits/instructions:
 *   get:
 *     tags: [Deposits]
 *     summary: Get bank transfer instructions
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Admin bank details for manual transfer
 */
router.get('/instructions', authenticate, requireVerified, depositController.getInstructions);

/**
 * @swagger
 * /deposits/feed:
 *   get:
 *     tags: [Deposits]
 *     summary: Get public feed of recent completed deposits (anonymized)
 *     responses:
 *       200:
 *         description: List of recent deposits with anonymized user info
 */
router.get('/feed', depositController.getPublicFeed);

module.exports = router;
