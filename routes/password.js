const express = require('express');
const passwordControllers = require('../controllers/password');
const route = express.Router();

route.post('/forgotpassword', passwordControllers.postForgotPassword);
route.get('/resetpassword/:id', passwordControllers.getResetPassword);
route.get('/updatepassword/:id', passwordControllers.getUpdatePassword);
module.exports = route;