const Sib = require('sib-api-v3-sdk');
const sequelize = require('../utils/database');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const Forgotpassword = require('../models/forgotpassword');
const uuid = require('uuid');
exports.postForgotPassword = async (req, res, next) => {
    let t = await sequelize.transaction();
    try {
        const emailId = req.body.emailId;
        let user = await User.findOne({ where: { email: emailId } });
        if (user) {
            try {
                const id = uuid.v4();
                await user.createForgotpassword({ id: id, isactive: true }, { transaction: t });
                const client = Sib.ApiClient.instance;
                const apiKey = client.authentications['api-key'];
                apiKey.apiKey = process.env.SIB_KEY_SECRET;
                const tranEmailApi = new Sib.TransactionalEmailsApi();
                const sender = { name: process.env.SENDER_NAME, email: process.env.SENDER_EMAIL };
                const receivers = [{ email: emailId }];
                await tranEmailApi.sendTransacEmail({
                    sender,
                    to: receivers,
                    subject: 'Reset your password in Expense Tracker App',
                    htmlContent: `<a href="http://localhost:3000/password/resetpassword/${id}">Change your password</a>`
                });
                await t.commit();
                return res.status(201).json({ message: 'Link to reset password sent to your mail ' });
            } catch (error) {
                throw new Error('Something went wrong');
            }
        } else {
            throw new Error('Something went wrong');
        }
    } catch (error) {
        await t.rollback();
        return res.status(500).json({ message: 'Something went wrong' });
    }
}

exports.getResetPassword = async (req, res, next) => {
    try {
        const id = req.params.id;
        let data = await Forgotpassword.findOne({ where: { id: id } });
        if (data) {
            res.status(200).send(`<html>
                                    <form action="/password/updatepassword/${id}" method="get">
                                        <label for="newpassword">Enter new password : </label>
                                        <input name="newpassword" type="password" required></input>
                                        <button>reset password</button>
                                    </form>
                                </html>
                                <script>
                                        function formsubmitted(e){
                                            e.preventDefault();
                                        }
                                </script>`
            );
            res.end();
        }
    } catch (error) {

    }

}
exports.getUpdatePassword = async (req, res, next) => {
    let t = await sequelize.transaction();
    try {
        const id = req.params.id;
        const password = req.query.newpassword;
        let data = await Forgotpassword.findOne({ where: { id: id, isactive: true } });
        if (data) {
            try {
                const user = await User.findOne({ where: { id: data.userId } });
                if (user) {
                    const saltRounds = 10;
                    bcrypt.hash(password, saltRounds, async (err, hash) => {
                        if (err) {
                            throw new Error('Something went wrong');
                        }
                        await user.update({ password: hash }, { transaction: t });
                        await data.update({ isactive: false }, { transaction: t });
                        await t.commit();
                        return res.status(201).json({ message: 'Successfuly update the new password' })
                    })
                }
            } catch (error) {
                throw new Error('Something went wrong');
            }
        }
    } catch (error) {
        await t.rollback();
        res.status(404).json(error);
    }

}