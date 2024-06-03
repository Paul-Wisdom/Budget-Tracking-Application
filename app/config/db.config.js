require("dotenv").config();

module.exports = {
    HOST: 'localhost',
    USER: process.env.DB_USER, //env
    PASSWORD: process.env.DB_PASS,
    DIALECT: 'mysql',
    DB: process.env.DB //env
}