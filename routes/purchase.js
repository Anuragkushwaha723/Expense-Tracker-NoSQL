const express = require('express');
const purchaseControllers = require('../controllers/purchase');
const authenticateRoutes = require('../middlewares/auth');
const route = express.Router();

route.get('/purchasemembership', authenticateRoutes.authenticate, purchaseControllers.purchasepremium);
route.post('/updatetransactionstatus', authenticateRoutes.authenticate, purchaseControllers.updateTransactionStatus);
route.post('/failedtransactionstatus', authenticateRoutes.authenticate, purchaseControllers.failedTransactionStatus);
module.exports = route;