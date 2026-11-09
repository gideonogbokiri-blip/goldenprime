const express = require('express');
const settingsController = require('../controllers/settingsController');
const authenticate = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, settingsController.getPublicSettings);

module.exports = router;
