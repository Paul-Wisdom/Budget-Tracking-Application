const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
require('dotenv').config();
const morgan = require('morgan'); 


const createPdf = require('./pdf-test');

const authRoutes = require('../../app/routes/auth');
const budgetRoutes = require('../../app/routes/budget');

morgan.token('data', (req) => {
    if(req.method === 'POST' || req.method === 'PUT')
        {
            return JSON.stringify(req.body);
        }
    return ' ';
})


function createServer(){

const app = express();

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'));
app.use(express.json());

app.use(express.urlencoded({extended: true}));

app.get('/', (req, res, next) => {
    res.json({message: "welcome"});
});
app.use(authRoutes);
app.use(budgetRoutes);

return app;
}

module.exports = createServer