const express = require('express');
const authenticate = require('../middleware/auth');
const p2pController = require('../controllers/p2pTradingController');

const router = express.Router();

/**
 * @swagger
 * /p2p/orderbook/{coin}:
 *   get:
 *     tags: [P2P Trading]
 *     summary: Get order book for a coin (buy/sell orders + market stats)
 *     parameters:
 *       - in: path
 *         name: coin
 *         required: true
 *         schema:
 *           type: string
 *           enum: [GPG, BTC, ETH, SOL, USDT, USDC]
 *     responses:
 *       200:
 *         description: Order book with buyOrders, sellOrders, stats, marketPrice
 */
router.get('/orderbook/:coin', p2pController.getOrderBook);

/**
 * @swagger
 * /p2p/orders:
 *   post:
 *     tags: [P2P Trading]
 *     summary: Create a new buy or sell order
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [type, coin, amount, pricePerUnit]
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [buy, sell]
 *               coin:
 *                 type: string
 *                 enum: [GPG, BTC, ETH, SOL, USDT, USDC]
 *               amount:
 *                 type: number
 *               pricePerUnit:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *                 enum: [bank_transfer, card]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Order created
 *       400:
 *         description: Insufficient balance or invalid params
 */
router.post('/orders', authenticate, p2pController.createOrder);

/**
 * @swagger
 * /p2p/orders/{id}:
 *   delete:
 *     tags: [P2P Trading]
 *     summary: Cancel an open order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Order cancelled, escrow unlocked
 *       400:
 *         description: Not your order or already filled
 */
router.delete('/orders/:id', authenticate, p2pController.cancelOrder);

/**
 * @swagger
 * /p2p/orders/{id}/take:
 *   post:
 *     tags: [P2P Trading]
 *     summary: Take (fill) an existing order
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 description: Amount to trade (must be <= order amount)
 *     responses:
 *       200:
 *         description: Trade initiated in escrow
 *       400:
 *         description: Insufficient balance or invalid amount
 */
router.post('/orders/:id/take', authenticate, p2pController.takeOrder);

/**
 * @swagger
 * /p2p/my-orders:
 *   get:
 *     tags: [P2P Trading]
 *     summary: Get current user's P2P orders
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, filled, cancelled]
 *     responses:
 *       200:
 *         description: List of user orders
 */
router.get('/my-orders', authenticate, p2pController.getMyOrders);

/**
 * @swagger
 * /p2p/my-trades:
 *   get:
 *     tags: [P2P Trading]
 *     summary: Get current user's P2P trades
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [escrow, completed, disputed]
 *     responses:
 *       200:
 *         description: List of user trades
 */
router.get('/my-trades', authenticate, p2pController.getMyTrades);

/**
 * @swagger
 * /p2p/trades/{id}:
 *   get:
 *     tags: [P2P Trading]
 *     summary: Get trade details with chat messages
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Trade details with messages array
 *       403:
 *         description: Not your trade
 */
router.get('/trades/:id', authenticate, p2pController.getTrade);

/**
 * @swagger
 * /p2p/trades/{id}/confirm:
 *   post:
 *     tags: [P2P Trading]
 *     summary: Confirm trade release (both parties must confirm)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Confirmation recorded (or trade completed)
 *       400:
 *         description: Not in escrow
 */
router.post('/trades/:id/confirm', authenticate, p2pController.confirmTrade);

/**
 * @swagger
 * /p2p/trades/{id}/dispute:
 *   post:
 *     tags: [P2P Trading]
 *     summary: File a dispute for a trade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [reason]
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trade disputed, admin review pending
 */
router.post('/trades/:id/dispute', authenticate, p2pController.disputeTrade);

/**
 * @swagger
 * /p2p/trades/{id}/message:
 *   post:
 *     tags: [P2P Trading]
 *     summary: Send a chat message in a trade
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Trade updated with new message
 */
router.post('/trades/:id/message', authenticate, p2pController.sendMessage);

module.exports = router;
