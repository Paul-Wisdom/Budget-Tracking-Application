const Sequelize = require('sequelize');



const config = require('../config/db.config');

//add port
const sequelize = new Sequelize(
    config.DB,
    config.USER,
    config.PASSWORD,
    {
        host: config.HOST,
        dialect:config.DIALECT
    }
);


module.exports = sequelize;