const Expense = require('../models/expense');
const DownloadList = require('../models/downloadList');
const S3Services = require('../services/S3Services');
exports.postExpenseData = async (req, res, next) => {
    try {
        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;

        if (!amount || !description || !category) {
            return res.status(500).json({ message: 'Missing some data' });
        }
        const expense = new Expense({ amount: amount, description: description, category: category, userId: req.user });
        await expense.save();
        let totalExpense = Number(req.user.totalExpense) + Number(amount);
        req.user.totalExpense = totalExpense;
        await req.user.save();
        let allExpensesCount = await Expense.countDocuments({ 'userId': req.user.id });
        let itemsPerPage = Number(req.query.itemsPerPage) || 6;
        let page = Math.ceil(allExpensesCount / itemsPerPage) || 1;
        let dataRes = await Expense.find({ 'userId': req.user }).skip((page - 1) * itemsPerPage).limit(itemsPerPage);
        return res.status(201).json({
            product: dataRes,
            pageData: {
                hasCurrentPage: allExpensesCount > 0,
                currentPage: page,
                hasNextPage: itemsPerPage * page < allExpensesCount,
                nextpage: +page + 1,
                hasPreviousPage: page > 1,
                previousPage: page - 1,
                hasLastPage: Math.ceil(allExpensesCount / itemsPerPage) > +page + 1,
                lastPage: Math.ceil(allExpensesCount / itemsPerPage)
            }
        });
    } catch (error) {
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.getExpenseData = async (req, res, next) => {
    try {
        let page = req.query.page || 1;
        let itemsPerPage = Number(req.query.itemsPerPage) || 6;
        let totalExpense = await Expense.countDocuments({ userId: req.user });
        let data = await Expense.find({ 'userId': req.user }).skip((page - 1) * itemsPerPage).limit(itemsPerPage);
        res.status(201).json({
            product: data,
            pageData: {
                hasCurrentPage: totalExpense > 0,
                currentPage: page,
                hasNextPage: itemsPerPage * page < totalExpense,
                nextpage: +page + 1,
                hasPreviousPage: page > 1,
                previousPage: page - 1,
                hasLastPage: Math.ceil(totalExpense / itemsPerPage) > +page + 1,
                lastPage: Math.ceil(totalExpense / itemsPerPage)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.deleteExpenseData = async (req, res, next) => {
    try {
        const prodId = req.params.id;
        let data = await Expense.find({ _id: prodId, userId: req.user });
        let updateExpense;
        let newExpense = Number(req.user.totalExpense) - Number(data[0].amount);
        if (newExpense > 0) {
            updateExpense = newExpense;
        } else {
            updateExpense = 0;
        }
        req.user.totalExpense = updateExpense;
        await req.user.save();
        await Expense.findByIdAndRemove(prodId);
        let allExpensesCount = await Expense.countDocuments({ userId: req.user });
        let itemsPerPage = Number(req.query.itemsPerPage) || 6;
        let page = Number(req.query.page) || 1;
        let dataRes = await Expense.find({ 'userId': req.user }).skip((page - 1) * itemsPerPage).limit(itemsPerPage);
        res.status(201).json({
            product: dataRes,
            pageData: {
                hasCurrentPage: allExpensesCount > 0,
                currentPage: page,
                hasNextPage: itemsPerPage * page < allExpensesCount,
                nextpage: +page + 1,
                hasPreviousPage: page > 1,
                previousPage: page - 1,
                hasLastPage: Math.ceil(allExpensesCount / itemsPerPage) > +page + 1,
                lastPage: Math.ceil(allExpensesCount / itemsPerPage)
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong' });
    }
};


exports.downloadExpenses = async (req, res, next) => {
    try {
        if (!req.user.ispremiumuser) {
            return res.status(401).json({ message: 'User is not a premium User' })
        }
        const expenses = await Expense.find({ 'userId': req.user });
        const expenseStringify = JSON.stringify(expenses);
        const userId = req.user.id;
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileUrl = await S3Services.uploadToS3(expenseStringify, filename);
        let newDate = new Date();
        const downloadList = new DownloadList({ url: fileUrl, date: newDate, userId: req.user });
        await downloadList.save();
        res.status(201).json({ fileUrl: fileUrl });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}

exports.listOfDownloads = async (req, res, next) => {
    try {
        if (!req.user.ispremiumuser) {
            return res.status(401).json({ message: 'User is not a premium User' })
        }
        let listOfDownloadsInfo = await DownloadList.find({ 'userId': req.user });
        res.status(201).json(listOfDownloadsInfo);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}
