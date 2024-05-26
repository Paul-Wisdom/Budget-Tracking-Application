const sequelize = require('./index');
const Sequelize = require('sequelize');

const Budget = sequelize.define('budget', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }, 
    
    name: {
        type: Sequelize.STRING
    },

    duration: {
        type: Sequelize.INTEGER,
    }
});

module.exports = Budget;