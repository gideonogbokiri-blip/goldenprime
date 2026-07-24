const express = require('express');
const authenticate = require('../middleware/auth');
const preorderController = require('../controllers/preorderController');

const router = express.Router();

/**
 * @swagger
 * /gold/coin:
 *   get:
 *     tags: [GPG Gold Coin]
 *     summary: Get GPG coin info (price, supply, sold, remaining)
 *     responses:
 *       200:
 *         description: GPG coin details
 */
router.get('/coin', preorderController.getCoinInfo);

/**
 * @swagger
 * /gold/preorder:
 *   post:
 *     tags: [GPG Gold Coin]
 *     summary: Preorder GPG coins
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [amount, paymentMethod]
 *             properties:
 *               amount:
 *                 type: number
 *                 description: USD amount to preorder
 *               paymentMethod:
 *                 type: string
 *                 enum: [bank_transfer, card]
 *               bankName:
 *                 type: string
 *               accountNumber:
 *                 type: string
 *               accountName:
 *                 type: string
 *               cardHolder:
 *                 type: string
 *               cardLast4:
 *                 type: string
 *     responses:
 *       201:
 *         description: Preorder created, pending admin approval
 *       400:
 *         description: Invalid amount
 */
router.post('/preorder', authenticate, preorderController.preorder);

/**
 * @swagger
 * /gold/my:
 *   get:
 *     tags: [GPG Gold Coin]
 *     summary: Get current user's preorders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of user preorders
 */
router.get('/my', authenticate, preorderController.getMyPreorders);

/**
 * @swagger
 * /gold/portfolio:
 *   get:
 *     tags: [GPG Gold Coin]
 *     summary: Get GPG portfolio (balance + value)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: GPG holdings and total value
 */
router.get('/portfolio', authenticate, preorderController.getPortfolio);

/**
 * @swagger
 * /gold/referral:
 *   get:
 *     tags: [GPG Gold Coin]
 *     summary: Get referral info (code, count, earnings, tier)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Referral code, count, earnings, tier info
 */
router.get('/referral', authenticate, preorderController.getReferralInfo);

/**
 * @swagger
 * /gold/leaderboard:
 *   get:
 *     tags: [GPG Gold Coin]
 *     summary: Get referral leaderboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Top referrers with tier info
 */
router.get('/leaderboard', authenticate, preorderController.getLeaderboard);

/**
 * @swagger
 * /gold/bank-details:
 *   get:
 *     tags: [GPG Gold Coin]
 *     summary: Get saved bank details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved bank account info
 */
router.get('/bank-details', authenticate, preorderController.getMyBankDetails);

/**
 * @swagger
 * /gold/card-details:
 *   get:
 *     tags: [GPG Gold Coin]
 *     summary: Get saved card details
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Saved card info (last 4 digits only)
 */
router.get('/card-details', authenticate, preorderController.getMyCardDetails);

/**
 * @swagger
 * /gold/tier:
 *   get:
 *     tags: [GPG Gold Coin]
 *     summary: Get current user's referral tier info
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tier name, progress, next tier info
 */
router.get('/tier', authenticate, preorderController.getTierInfo);

/**
 * @swagger
 * /gold/tiers:
 *   get:
 *     tags: [GPG Gold Coin]
 *     summary: Get all referral tiers (public)
 *     responses:
 *       200:
 *         description: All tiers with thresholds and rewards
 */
router.get('/tiers', preorderController.getAllTiers);

module.exports = router;
