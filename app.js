const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const userModel = require('./models/user');
// const expenseModel = require('./models/expense');
// const orderModel = require('./models/order');
// const forgotpasswordModel = require('./models/forgotpassword');
// const downloadListModel = require('./models/downloadList');
const userRoutes = require('./routes/user');
// const expenseRoutes = require('./routes/expense');
// const purchaseRoutes = require('./routes/purchase');
// const premiumRoutes = require('./routes/premium');
// const passwordRoutes = require('./routes/password');
// const sequelize = require('./utils/database');
const app = express();

app.use(cors());
app.use(bodyParser.json({ extended: false }));
app.use('/user', userRoutes);
// app.use('/expense', expenseRoutes);
// app.use('/purchase', purchaseRoutes);
// app.use('/premium', premiumRoutes);
// app.use('/password', passwordRoutes);
app.use((req, res, next) => {
    res.sendFile(path.join(__dirname, `public/${req.url}`));
})
mongoose.connect('')
    .then(res => {
        app.listen(3000);
    })
    .catch(err => console.log(err));





// userModel.hasMany(expenseModel);
// expenseModel.belongsTo(userModel);
// userModel.hasMany(orderModel);
// orderModel.belongsTo(userModel);
// userModel.hasMany(forgotpasswordModel);
// forgotpasswordModel.belongsTo(userModel);
// userModel.hasMany(downloadListModel);
// downloadListModel.belongsTo(userModel);
// sequelize.sync()
//     .then((result) => {
//         app.listen(process.env.PORT || 4000);
//     })
//     .catch();
