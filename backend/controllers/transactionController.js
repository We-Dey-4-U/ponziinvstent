// transactionController.js

const FinancialTransaction = require('../models/financialTransaction');
const User = require('../models/user');

exports.requestWithdrawal = async (req, res) => {
  try {
    const { email } = req.params;
    const { amount } = req.body;

    // Fetch user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has sufficient funds in wallet and earnings
    const totalBalance = user.walletBalance + user.earnings;

    if (totalBalance < amount) {
      return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Check if user is eligible for withdrawal based on contract duration
    const now = new Date();
    const contractStart = new Date(user.createdAt);
    const daysPassed = Math.ceil((now - contractStart) / (1000 * 60 * 60 * 24));

    if (daysPassed < 24) {
      return res.status(400).json({ message: 'Withdrawal is only allowed after 24 days of investment' });
    }

    // Check if user is eligible for contract closure
    if (daysPassed < 42) {
      return res.status(400).json({ message: 'Contract closure is only allowed after 42 days of investment' });
    }

    // Deduct amount from earnings first, then from wallet balance if necessary
    if (user.earnings >= amount) {
      user.earnings -= amount;
    } else {
      const remainingAmount = amount - user.earnings;
      user.earnings = 0;
      user.walletBalance -= remainingAmount;
    }

    // Create withdrawal financial transaction
    const withdrawalTransaction = new FinancialTransaction({
      user: user._id,
      type: 'withdrawals',
      amount: amount,
      date: Date.now()
    });

    // Save user and financial transaction
    await Promise.all([user.save(), withdrawalTransaction.save()]);

    res.status(200).json({ message: 'Withdrawal request submitted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getUserTransactions = async (req, res) => {
  try {
    const { email } = req.params;

    // Fetch transactions for the user
    const user = await User.findOne({ email });
    const transactions = await FinancialTransaction.find({ user: user._id });

    res.status(200).json({ transactions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};