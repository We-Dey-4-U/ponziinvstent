const mongoose = require('mongoose');

// Define the schema for a single top-up
const topUpSchema = new mongoose.Schema({
    amount: { type: Number, required: true, min: 0 },
    dailyReturn: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 0 },
    totalReturn: { type: Number, required: true, min: 0 },
    
    
    
});

// Define the main investment schema
const investmentSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true, min: 0 },
    totalReturn: { type: Number, required: true, min: 0 },
    dailyReturn: { type: Number, required: true, min: 0 },
    remainingDays: { type: Number, required: true, min: 0 },
    referralCommission: {
        adminCommission: { type: Number, default: 0 },
        directReferralCommission: { type: Number, default: 0 },
        indirectReferralCommission: { type: Number, default: 0 }
    },
    startDate: { type: Date, required: true },
    walletBalance: { type: Number, default: 0 },
    topUps: [topUpSchema] // Array of top-ups, each with its own schema
});

module.exports = mongoose.model('Investment', investmentSchema);