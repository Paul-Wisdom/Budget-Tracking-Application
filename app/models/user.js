const sequelize = require('./index');
const Sequelize = require('sequelize');

const User = sequelize.define('user', {

    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    }, 

    username: {
        type: Sequelize.STRING
    },

    email: {
        type: Sequelize.STRING
    },

    password: {
        type: Sequelize.STRING
    },
    verified: {
        type: Sequelize.BOOLEAN
    }
});

module.exports = User;