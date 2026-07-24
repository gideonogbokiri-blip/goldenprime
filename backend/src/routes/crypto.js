const express = require('express');
const cryptoService = require('../services/cryptoService');

const router = express.Router();

/**
 * @swagger
 * /crypto/prices:
 *   get:
 *     tags: [Crypto]
 *     summary: Get real-time prices for all supported cryptocurrencies
 *     responses:
 *       200:
 *         description: Array of coin prices from CoinGecko
 */
router.get('/prices', async (req, res, next) => {
  try {
    const prices = await cryptoService.getPrices();
    res.json({ prices });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /crypto/coin/{id}:
 *   get:
 *     tags: [Crypto]
 *     summary: Get detailed info for a specific coin
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: CoinGecko coin ID (e.g. bitcoin, ethereum)
 *     responses:
 *       200:
 *         description: Coin detail with price, market cap, 24h change
 */
router.get('/coin/:id', async (req, res, next) => {
  try {
    const detail = await cryptoService.getCoinDetail(req.params.id);
    res.json({ coin: detail });
  } catch (err) {
    next(err);
  }
});

/**
 * @swagger
 * /crypto/supported:
 *   get:
 *     tags: [Crypto]
 *     summary: List all supported cryptocurrencies
 *     responses:
 *       200:
 *         description: Array of supported coins with id, symbol, name
 */
router.get('/supported', (req, res) => {
  res.json({ coins: cryptoService.SUPPORTED_COINS });
});

module.exports = router;
