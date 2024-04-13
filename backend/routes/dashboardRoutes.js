const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const authMiddleware = require('../middleware/authMiddleware');

// Secure access to dashboard routes
router.use(authMiddleware.authenticateUser);

// Route: GET /api/dashboard/investments
// Description: Get investment details for the current user
router.get('/investments', dashboardController.getUserInvestments);

// Route: GET /api/dashboard/earnings
// Description: Get earnings details for the current user
router.get('/earnings', dashboardController.getUserEarnings);

// Route: GET /api/dashboard/referrals
// Description: Get referral details for the current user
router.get('/referrals', dashboardController.getUserReferrals);

module.exports = router;