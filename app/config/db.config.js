require("dotenv").config();

module.exports = {
    HOST: 'localhost',
    USER: 'root',
    PASSWORD: process.env.DB_PASS,
    DIALECT: 'mysql',
    DB: 'budget-tracker'
}