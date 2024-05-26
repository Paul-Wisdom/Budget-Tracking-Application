const sequelize = require('./index');
const Sequelize = require('sequelize');

const Income = sequelize.define('income', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }, 
    
    name: {
        type: Sequelize.STRING
    },
    
    amount: {
        type: Sequelize.FLOAT
    }
});

module.exports = Income;