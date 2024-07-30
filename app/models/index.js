const Sequelize = require('sequelize');



const config = require('../config/db.config');
const ENV = process.env.ENV || 'development';

//add port
let sequelize;

if (ENV === 'development')
{
    sequelize = new Sequelize(
        config.DB,
        config.USER,
        config.PASSWORD,
        {
            host: config.HOST,
            dialect:config.DIALECT
        }
    );
    
}


module.exports = sequelize;