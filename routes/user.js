const express = require('express');
const userController = require('../controllers/user');
const route = express.Router();

route.post('/signUp', userController.postUserSignUp);
route.post('/login', userController.postUserLogin);
module.exports = route;