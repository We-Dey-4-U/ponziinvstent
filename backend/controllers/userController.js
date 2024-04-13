const User = require('../models/user');
const bcrypt = require('bcryptjs');
const Investment = require('../models/investment');

// Function to generate random alphanumeric referral code
function generateReferralCode(length) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let referralCode = '';
  for (let i = 0; i < length; i++) {
    referralCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return referralCode;
}

// Function to generate referral link
function generateReferralLink(baseURL, referralCode) {
  return `${baseURL}/register?ref=${referralCode}`;
}



// Register a new user
// Register a new user
exports.registerUser = async (req, res) => {
  try {
    const { username, email, password, referralCode, mobileNumber } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    let referrer = null;
    if (referralCode) {
      // Find referrer by referral code
      referrer = await User.findOne({ referralCode });
      if (!referrer) {
        return res.status(404).json({ message: 'Invalid referral code' });
      }
    }

    // Generate unique referral code
    const newReferralCode = generateReferralCode(8);

    // Generate referral link
    const baseURL = req.protocol + '://' + req.get('host');
    const referralLink = generateReferralLink(baseURL, newReferralCode);

    // Create user
    user = new User({
      username,
      email,
      password: hashedPassword,
      referralCode: newReferralCode,
      referralLink,
      referredBy: referrer ? referrer.mobileNumber : null, // Store referrer's mobile number if available
      mobileNumber
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get referral information for a user
exports.getReferralInfo = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user details including referredBy
    const user = await User.findById(userId).populate('referredBy');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ 
      user: {
        username: user.username,
        email: user.email,
        mobileNumber: user.mobileNumber,
        referralCode: user.referralCode,
        referralLink: user.referralLink,
        referredBy: user.referredBy ? user.referredBy.mobileNumber : null,
        earnings: user.earnings,
        withdrawnCommissions: user.withdrawnCommissions,
        withdrawnEarnings: user.withdrawnEarnings,
        walletBalance: user.walletBalance,
        investments: user.investments // Investments array is populated
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get referrals made by a user
// Get referrals made by a user
exports.getReferrals = async (req, res) => {
  try {
    const userId = req.params.userId;

    // Fetch user details including referrals
    const user = await User.findById(userId).populate('referrals', 'username email');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ referrals: user.referrals });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};



