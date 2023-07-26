const mongoose = require('mongoose');
const { INTEGER } = require('sequelize');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    ispremiumuser: {
        type: Boolean,
    },
    totalExpense: {
        type: Number,
        default: 0
    }
});



module.exports = mongoose.model('User', userSchema);

// const Sequelize = require('sequelize');
// const sequelize = require('../utils/database');

// const User = sequelize.define('users', {
//     id: {
//         type: Sequelize.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     name: {
//         type: Sequelize.STRING,
//     },
//     email: {
//         type: Sequelize.STRING,
//         unique: true
//     },
//     password: {
//         type: Sequelize.STRING,
//     },
//     ispremiumuser: Sequelize.BOOLEAN,
//     totalExpense: {
//         type: Sequelize.INTEGER,
//         defaultValue: 0
//     }
// })


// module.exports = User;