const sequelize = require('./index');
const Sequelize = require('sequelize');

const Budget = sequelize.define('budget', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },

    current: {
        type: Sequelize.BOOLEAN,
    },
    month: {
        type: Sequelize.STRING
    }
});

module.exports = Budget;