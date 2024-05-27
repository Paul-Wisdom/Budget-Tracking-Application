const sequelize = require('./index');
const Sequelize = require('sequelize');

const NewPassword = sequelize.define('new-password', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }, 

    userId: {
        type: Sequelize.INTEGER
    },
    
    password: {
        type: Sequelize.STRING
    },
    
    createdAt: {
        type: Sequelize.DATE
    },

    expiresAt: {
        type: Sequelize.DATE
    }
});

module.exports = NewPassword;