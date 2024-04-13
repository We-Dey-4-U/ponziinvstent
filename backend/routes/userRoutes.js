const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route: POST /api/users/register-user
// Description: Register a new user
router.post('/register-user', userController.registerUser);

// Route: GET /api/users/:userId/referral-information
// Description: Get referral information for a user
router.get('/:userId/referral-information', userController.getReferralInfo);

// Route: GET /api/users/:userId/referrals
// Description: Get referrals made by a user
router.get('/:userId/referrals', userController.getReferrals);

// Error handling middleware
router.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Server Error');
});

module.exports = router;