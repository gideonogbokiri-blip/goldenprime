const express = require('express');
const authenticate = require('../middleware/auth');
const requireVerified = require('../middleware/requireVerified');
const kycController = require('../controllers/kycController');

const router = express.Router();

/**
 * @swagger
 * /kyc/submit:
 *   post:
 *     tags: [KYC]
 *     summary: Submit KYC verification documents
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name, date_of_birth, country, document_type, document_number]
 *             properties:
 *               full_name:
 *                 type: string
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *               country:
 *                 type: string
 *               document_type:
 *                 type: string
 *                 enum: [passport, drivers_license, national_id]
 *               document_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: KYC submitted for review
 */
router.post('/submit', authenticate, requireVerified, kycController.submit);

/**
 * @swagger
 * /kyc/status:
 *   get:
 *     tags: [KYC]
 *     summary: Get KYC verification status
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: KYC status (pending, approved, rejected)
 */
router.get('/status', authenticate, requireVerified, kycController.getStatus);

module.exports = router;
