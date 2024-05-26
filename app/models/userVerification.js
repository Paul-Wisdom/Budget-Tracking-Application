const sequelize = require('./index');
const Sequelize = require('sequelize');

const Verification = sequelize.define('verification', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }, 

    userId: {
        type: Sequelize.INTEGER
    },
    
    string: {
        type: Sequelize.STRING
    },
    
    createdAt: {
        type: Sequelize.DATE
    },

    expiresAt: {
        type: Sequelize.DATE
    }
});

module.exports = Verification;