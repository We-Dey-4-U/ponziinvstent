const User = require('../models/user');

exports.getUserInvestments = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming user ID is stored in the request object after authentication
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Fetch user's investment details from the database and return them
    res.status(200).json({ investments: user.investments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};




exports.getUserEarnings = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming user ID is stored in the request object after authentication
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Fetch user's earnings details from the database and return them
      res.status(200).json({ earnings: user.earnings });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  exports.getUserReferrals = async (req, res) => {
    try {
      const userId = req.user.id; // Assuming user ID is stored in the request object after authentication
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Fetch user's referral details from the database and return them
      res.status(200).json({ referrals: user.referrals });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Implement similar methods for getUserEarnings and getUserReferrals