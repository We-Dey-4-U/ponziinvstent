// financialTransaction.js

const mongoose = require('mongoose');

const financialTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['earnings', 'withdrawals', 'commissions'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('FinancialTransaction', financialTransactionSchema);