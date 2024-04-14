const User = require('../models/user');
const Investment = require('../models/investment');

// Function to calculate the total return for the investment
function calculateTotalReturn(investmentAmount, durationInDays) {
    const dailyReturnRate = 0.08; // Fixed daily return rate of 8%
    const totalReturn = investmentAmount * (1 + dailyReturnRate * durationInDays);
    return totalReturn;
}

// Function to calculate the daily return for the investment
function calculateDailyReturn(investmentAmount, durationInDays) {
    const dailyReturnRate = 0.08; // Fixed daily return rate of 8%
    return investmentAmount * dailyReturnRate;
}

// Function to calculate referral commissions
function calculateReferralCommission(investmentAmount, referrer) {
    const adminCommissionPercentage = 0.08; // 8% commission for admin
    const directReferralCommissionPercentage = 0.03; // 3% commission for direct referrer
    const indirectReferralCommissionPercentage = 0.02; // 2% commission for indirect referrer
    
    return {
        adminCommission: investmentAmount * adminCommissionPercentage,
        directReferralCommission: investmentAmount * directReferralCommissionPercentage,
        indirectReferralCommission: investmentAmount * indirectReferralCommissionPercentage
    };
}

// Function to calculate earnings for the current period
function calculateEarnings(investment) {
    const totalDuration = investment.duration;
    const daysElapsed = Math.ceil((Date.now() - investment.startDate) / (1000 * 60 * 60 * 24));
    const remainingDays = totalDuration - daysElapsed;
    
    return investment.dailyReturn * remainingDays;
}

// Function to perform top-up
async function performTopUp(investment, amount) {
    try {
        if (amount < 5000) {
            return { success: false, error: 'Minimum top-up amount is 5000' };
        }

        const daysElapsed = Math.ceil((Date.now() - investment.startDate) / (1000 * 60 * 60 * 24));
        const remainingDays = investment.duration - daysElapsed;

        if (remainingDays <= 0) {
            return { success: false, error: 'Investment duration has expired' };
        }

        // Calculate daily return and total return for the top-up amount
        const dailyReturn = calculateDailyReturn(amount, remainingDays);
        const totalReturn = calculateTotalReturn(amount, remainingDays);

        // Update wallet balance
        investment.walletBalance += amount;

        // Create a new top-up object
        const topUp = {
            amount,
            totalReturn,
            duration: remainingDays,
            dailyReturn
        };

        // Push the new top-up object to the topUps array
        investment.topUps.push(topUp);

        // Save the investment document
        await investment.save();

        return { success: true, walletBalance: investment.walletBalance };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Server error' };
    }
}



// Function to handle investment creation
// Function to handle investment creation
// Function to handle investment creation
exports.makeInvestment = async (req, res) => {
    try {
        const { userEmail, investmentAmount, durationInDays } = req.body;
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (isNaN(durationInDays) || durationInDays <= 0 || investmentAmount <= 0 || investmentAmount % 5000 !== 0) {
            return res.status(400).json({ message: 'Invalid investment parameters' });
        }

        const totalAvailableBalance = user.walletBalance;

        if (totalAvailableBalance < investmentAmount) {
            return res.status(400).json({ message: 'Insufficient funds in the wallet to make this investment' });
        }

        const investmentCount = user.investments ? user.investments.filter(investment => investment.amount === investmentAmount).length : 0;

        if (investmentCount >= 2) {
            return res.status(400).json({ message: 'Each investment amount can only be invested two times' });
        }

        if (investmentCount === 1) {
            const maxPreviousInvestment = user.investments ? Math.max(...user.investments.map(investment => investment.amount)) : 0;

            if (investmentAmount <= maxPreviousInvestment * 2) {
                return res.status(400).json({ message: 'Investment amount should be double the highest previous investment for the third time' });
            }
        }

        const referralCommission = calculateReferralCommission(investmentAmount, user.mobileNumber);

        const totalReturn = calculateTotalReturn(investmentAmount, durationInDays);
        const dailyReturn = calculateDailyReturn(investmentAmount, durationInDays);

        // Update user's wallet balance
        user.walletBalance -= investmentAmount;
        await user.save();

         

        const investment = new Investment({
            user: user._id,
            amount: investmentAmount,
            duration: durationInDays,
            totalReturn: totalReturn,
            dailyReturn: dailyReturn,
            remainingDays: durationInDays,
            referralCommission,
            startDate: Date.now()
        });

        // Update initial investment's wallet balance
        investment.walletBalance += investmentAmount;

        await investment.save();

        // Distribute referral commissions
        await distributeReferralCommissions(user.mobileNumber, referralCommission);


        // Calculate total referral commission earned by the referrer
        const referrer = await User.findOne({ mobileNumber: user.referredBy });
        if (referrer) {
            const totalReferralCommission = referralCommission.directReferralCommission + referralCommission.indirectReferralCommission;
            referrer.walletBalance += totalReferralCommission;
            await referrer.save();
        }

        return res.status(201).json({ message: 'Investment created successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};





// Function to distribute referral commissions
// Function to distribute referral commissions
async function distributeReferralCommissions(referrerMobileNumber, referralCommission) {
    try {
        // Find the direct referee (immediate referral)
        const directReferee = await User.findOne({ referredBy: referrerMobileNumber });

        if (directReferee) {
            // Add direct referral commission to the direct referee's wallet balance
            directReferee.walletBalance += referralCommission.directReferralCommission;
            await directReferee.save();

            // Find the indirect referee (referral of the direct referee)
            const indirectReferee = await User.findOne({ referredBy: directReferee.mobileNumber });

            if (indirectReferee) {
                // Add indirect referral commission to the indirect referee's wallet balance
                indirectReferee.walletBalance += referralCommission.indirectReferralCommission;
                await indirectReferee.save();
            }
        } else {
            // If there's no direct referee, just distribute to the admin
            const adminUser = await User.findOne({ isAdmin: true });

            if (adminUser) {
                // Add admin commission to the admin user's wallet balance
                adminUser.walletBalance += referralCommission.adminCommission;
                await adminUser.save();
            }
        }
    } catch (error) {
        console.error('Error distributing referral commissions:', error);
    }
}





// Function to top up the wallet
exports.topUpWallet = async (req, res) => {
    try {
        const { userEmail, amount } = req.body;
        const user = await User.findOne({ email: userEmail });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const investment = await Investment.findOne({ user: user._id }).populate('topUps');

        if (!investment) {
            return res.status(400).json({ message: 'No investment found for the user' });
        }

        const currentEarnings = calculateEarnings(investment);
        const referralCommission = calculateReferralCommission(investment.amount, user.mobileNumber); // Calculate referral commission again

        const result = await performTopUp(investment, amount);

        if (result.success) {
            const populatedTopUps = await Investment.populate(investment, { path: 'topUps' });

            // Update user's wallet balance
            user.walletBalance += amount;
            await user.save();

             // Recalculate referral commission earnings for the referrer
             const referrer = await User.findOne({ mobileNumber: user.referredBy });
             if (referrer) {
                 const totalReferralCommission = referralCommission.directReferralCommission + referralCommission.indirectReferralCommission;
                 referrer.walletBalance += totalReferralCommission;
                 await referrer.save();
             }
            
            return res.status(200).json({ 
                message: 'Wallet topped up successfully', 
                walletBalance: result.walletBalance,
                currentEarnings: currentEarnings,
                topUps: populatedTopUps.topUps 
            });
        } else {
            return res.status(400).json({ message: result.error });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};