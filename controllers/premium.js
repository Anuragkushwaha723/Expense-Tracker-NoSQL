const User = require('../models/user');
const Expense = require('../models/expense');
module.exports.getLeaderboard = async (req, res, next) => {
    try {
        if (!req.user.ispremiumuser) {
            return res.status(401).json({ message: 'User is not a premium User' })
        }
        let leaderBoardOfAllUsers = await User.find().sort({ 'totalExpense': 'desc' });
        res.status(200).json(leaderBoardOfAllUsers);
    } catch (error) {
        res.status(403).json({ message: 'Something went wrong' });
    }
}