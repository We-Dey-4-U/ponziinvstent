// user.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  mobileNumber: { type: String, required: true, unique: true }, // New field for storing mobile number
  referralCode: { type: String },
  referralLink: { type: String },
  referredBy: { type: String },  // Assuming the referredBy is the mobile number of the referrer
  earnings: { type: Number, default: 0 },
  withdrawnCommissions: { type: Number, default: 0 },
  withdrawnEarnings: { type: Number, default: 0 },
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);