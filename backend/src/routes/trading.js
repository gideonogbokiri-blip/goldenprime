const express = require('express');
const authenticate = require('../middleware/auth');
const tradingController = require('../controllers/tradingController');

const router = express.Router();

/**
 * @swagger
 * /trading/buy:
 *   post:
 *     tags: [Trading]
 *     summary: Buy cryptocurrency with USD balance
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coinId, amount]
 *             properties:
 *               coinId:
 *                 type: string
 *                 description: CoinGecko coin ID (e.g. bitcoin)
 *               amount:
 *                 type: number
 *                 description: USD amount to spend
 *     responses:
 *       200:
 *         description: Purchase successful
 *       400:
 *         description: Insufficient balance or invalid coin
 */
router.post('/buy', authenticate, tradingController.buy);

/**
 * @swagger
 * /trading/sell:
 *   post:
 *     tags: [Trading]
 *     summary: Sell cryptocurrency for USD
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [coinId, amount]
 *             properties:
 *               coinId:
 *                 type: string
 *               amount:
 *                 type: number
 *                 description: Amount of crypto to sell
 *     responses:
 *       200:
 *         description: Sale successful
 *       400:
 *         description: Insufficient crypto balance
 */
router.post('/sell', authenticate, tradingController.sell);

/**
 * @swagger
 * /trading/portfolio:
 *   get:
 *     tags: [Trading]
 *     summary: Get user portfolio with holdings and total value
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Portfolio with holdings array and totalValue
 */
router.get('/portfolio', authenticate, tradingController.getPortfolio);

module.exports = router;
