exports.getExpenses = (req, where) => {
    return req.user.getExpenses(where);
};