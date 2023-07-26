const Sequelize = require('sequelize');
const sequelize = require('../utils/database');

const Forgotpassword = sequelize.define('forgotpasswords', {
    id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true
    },
    isactive: {
        type: Sequelize.BOOLEAN
    }
});


module.exports = Forgotpassword;