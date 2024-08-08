require("dotenv").config();

let host;
const env = process.env.ENV || 'development';

if (env === 'development')
    {
        host = 'localhost';
    }
else{
        host = process.env.DB_HOST;
    }
// add port
console.log(host);
module.exports = {
    HOST: host,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASS,
    DIALECT: 'mysql',
    PORT: process.env.DB_PORT,
    DB: process.env.DB 
}