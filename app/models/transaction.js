const sequelize = require('./index');
const Sequelize = require('sequelize');

const Transaction = sequelize.define('transaction', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }, 
    userId: {
        type:Sequelize.INTEGER
    },
    name: {
        type: Sequelize.STRING
    },
    type: {
        type: Sequelize.STRING
    },

    amount: {
        type: Sequelize.FLOAT
    },
    note: {
        type: Sequelize.TEXT
    }
});

module.exports = Transaction;