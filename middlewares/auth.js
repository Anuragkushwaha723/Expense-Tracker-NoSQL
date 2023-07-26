const jwt = require('jsonwebtoken');
const User = require('../models/user');

exports.authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization');
        const userData = jwt.verify(token, `${process.env.TOKEN_SECRET}`);
        let responseData = await User.findByPk(userData.userId);
        req.user = responseData;
        next();
    } catch (error) {
        res.status(500).json({ message: 'User not authenticate' });
    }
}