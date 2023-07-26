const express = require('express');
const expenseRoutes = require('../controllers/expense');
const authenticateRoutes = require('../middlewares/auth');
const route = express.Router();

route.post('/add-expense', authenticateRoutes.authenticate, expenseRoutes.postExpenseData);
route.get('/get-expense', authenticateRoutes.authenticate, expenseRoutes.getExpenseData);
route.delete('/delete-expense/:id', authenticateRoutes.authenticate, expenseRoutes.deleteExpenseData);
route.get('/download', authenticateRoutes.authenticate, expenseRoutes.downloadExpenses);
route.get('/lists', authenticateRoutes.authenticate, expenseRoutes.listOfDownloads);
module.exports = route;