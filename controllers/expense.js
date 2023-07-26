const Expense = require('../models/expense');
const DownloadList = require('../models/downloadList');
const sequelize = require('../utils/database');
const UserServices = require('../services/userservices');
const S3Services = require('../services/S3Services');
exports.postExpenseData = async (req, res, next) => {
    let t = await sequelize.transaction();
    try {
        const amount = req.body.amount;
        const description = req.body.description;
        const category = req.body.category;

        if (!amount || !description || !category) {
            return res.status(500).json({ message: 'Missing some data' });
        }
        await req.user.createExpense({ amount: amount, description: description, category: category }, { transaction: t });
        let totalExpense = Number(req.user.totalExpense) + Number(amount);
        await req.user.update({ totalExpense: totalExpense }, { transaction: t });
        await t.commit();
        let allExpensesCount = await Expense.count({ where: { userId: req.user.id } });
        let itemsPerPage = Number(req.query.itemsPerPage) || 6;
        let page = Math.ceil(allExpensesCount / itemsPerPage) || 1;
        let dataRes = await UserServices.getExpenses(req, {
            offset: (page - 1) * itemsPerPage,
            limit: itemsPerPage
        });

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
        await t.rollback();
        return res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.getExpenseData = async (req, res, next) => {
    try {
        let page = req.query.page || 1;
        let itemsPerPage = Number(req.query.itemsPerPage) || 6;
        let totalExpense = await Expense.count({ where: { userId: req.user.id } });
        let data = await UserServices.getExpenses(req, {
            offset: (page - 1) * itemsPerPage,
            limit: itemsPerPage
        });
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
    let t = await sequelize.transaction();
    try {
        const prodId = req.params.id;
        let data = await Expense.findAll({ where: { id: prodId, userId: req.user.id } }, { transaction: t });
        let updateExpense;
        let newExpense = Number(req.user.totalExpense) - Number(data[0].amount);
        if (newExpense > 0) {
            updateExpense = newExpense;
        } else {
            updateExpense = 0;
        }
        await req.user.update({ totalExpense: updateExpense }, { transaction: t });
        await data[0].destroy({ transaction: t });
        await t.commit();
        let allExpensesCount = await Expense.count({ where: { userId: req.user.id } });
        let itemsPerPage = Number(req.query.itemsPerPage) || 6;
        let page = Number(req.query.page) || 1;
        let dataRes = await UserServices.getExpenses(req, {
            offset: (page - 1) * itemsPerPage,
            limit: itemsPerPage
        });
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
        await t.rollback();
        res.status(500).json({ message: 'Something went wrong' });
    }
};


exports.downloadExpenses = async (req, res, next) => {
    try {
        if (!req.user.ispremiumuser) {
            return res.status(401).json({ message: 'User is not a premium User' })
        }
        const expenses = await UserServices.getExpenses(req, {
            attributes: ['amount', 'description', 'category']
        });
        const expenseStringify = JSON.stringify(expenses);
        const userId = req.user.id;
        const filename = `Expense${userId}/${new Date()}.txt`;
        const fileUrl = await S3Services.uploadToS3(expenseStringify, filename);
        let newDate = new Date();
        await req.user.createDownloadList({ url: fileUrl, date: newDate });
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
        let listOfDownloadsInfo = await req.user.getDownloadLists({
            attributes: ['date', 'url'],
        });
        res.status(201).json(listOfDownloadsInfo);
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong' });
    }
}
