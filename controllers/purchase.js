const Razorpay = require('razorpay');
const Order = require('../models/order');
const jwt = require('jsonwebtoken');
exports.purchasepremium = async (req, res, next) => {
    try {
        let rzp = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });
        const amount = 500;
        rzp.orders.create({ amount: amount, currency: "INR" }, async (err, order) => {
            if (err) {
                throw new Error(err);
            }
            const orderPr = new Order({ orderid: order.id, status: 'PENDING', userId: req.user });
            await orderPr.save();
            return res.status(201).json({ order, key_id: rzp.key_id });
        })
    } catch (error) {
        console.log(error);
        res.status(403).json({ message: 'Something went wrong' });
    }
}
exports.updateTransactionStatus = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { order_id, payment_id, } = req.body;
        const order = await Order.findOne({ 'orderid': order_id });
        order.paymentid = payment_id;
        order.status = 'SUCCESSFULL';
        const promise1 = order.save();
        req.user.ispremiumuser = true;
        const promise2 = req.user.save();
        await Promise.all([promise1, promise2]);
        return res.status(202).json({ success: true, message: 'Transcation Successfull', token: generateAccessToken(userId, undefined, true) })
    } catch (error) {
        res.status(403).json({ message: 'Something went wrong' });
    }
}

exports.failedTransactionStatus = async (req, res, next) => {
    try {
        const { order_id } = req.body;
        const order = await Order.findOne({ 'orderid': order_id });
        order.status = 'FAILED';
        await order.save();
        return res.status(203).json({ success: false, message: 'Transcation Failed' })
    } catch (error) {
        res.status(403).json({ message: 'Something went wrong' });
    }
}
function generateAccessToken(id, name, ispremiumuser) {
    return jwt.sign({ userId: id, name: name, ispremiumuser: ispremiumuser }, `${process.env.TOKEN_SECRET}`);
}