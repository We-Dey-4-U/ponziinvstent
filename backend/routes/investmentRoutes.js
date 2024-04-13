const express = require('express');
const router = express.Router();
const investmentController = require('../controllers/investmentController');

// Define routes
router.post('/topup', investmentController.topUpWallet);
router.post('/invest', investmentController.makeInvestment);

module.exports = router;