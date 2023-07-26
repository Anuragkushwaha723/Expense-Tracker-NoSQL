const express = require('express');
const premiumControllers = require('../controllers/premium');
const authenticateRoutes = require('../middlewares/auth');
const route = express.Router();

route.get('/showLeaderBoard', authenticateRoutes.authenticate, premiumControllers.getLeaderboard);
module.exports = route;