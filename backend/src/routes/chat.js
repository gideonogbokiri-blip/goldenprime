const express = require('express');
const authenticate = require('../middleware/auth');
const requireVerified = require('../middleware/requireVerified');
const chatController = require('../controllers/chatController');

const router = express.Router();

router.get('/messages', authenticate, requireVerified, chatController.getMessages);
router.post('/messages', authenticate, requireVerified, chatController.sendMessage);
router.post('/read', authenticate, chatController.markRead);

module.exports = router;