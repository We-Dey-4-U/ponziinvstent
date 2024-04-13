const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Route: POST /api/transactions/:userId/withdrawal
// Description: Request withdrawal
router.post('/:userId/withdrawal', transactionController.requestWithdrawal);

// Route: GET /api/transactions/:userId
// Description: Get user transactions
router.get('/:userId', transactionController.getUserTransactions);

module.exports = router;