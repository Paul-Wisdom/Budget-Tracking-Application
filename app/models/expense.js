const sequelize = require('./index');
const Sequelize = require('sequelize');

const Expense = sequelize.define('expense', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }, 
    
    name: {
        type: Sequelize.STRING
    },
    
    amountBudgeted: {
        type: Sequelize.FLOAT
    },

    amountSpent: {
        type: Sequelize.FLOAT
    }
});

module.exports = Expense;