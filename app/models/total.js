const sequelize = require('./index');
const Sequelize = require('sequelize');

const Total = sequelize.define('total', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }, 
    
    userId: {
        type: Sequelize.INTEGER
    },
    budgetId: {
        type: Sequelize.INTEGER
    },

    totalAmountBudgeted: {
        type: Sequelize.FLOAT
    },

    totalAmountSpent: {
        type: Sequelize.FLOAT
    },

    totalIncome: {
        type: Sequelize.FLOAT
    }
});

module.exports = Total;