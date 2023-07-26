const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const DownloadList = sequelize.define('downloadLists', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    url: {
        type: Sequelize.STRING,
    },
    date: {
        type: Sequelize.DATE,
    }
})


module.exports = DownloadList;