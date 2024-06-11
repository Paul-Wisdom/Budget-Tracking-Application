const express = require('express');
const cors = require('cors');
const schedule = require('node-schedule');
require('dotenv').config();

const sequelize = require("./app/models/index");
const User = require('./app/models/user');
const Budget = require('./app/models/budget');
const Expense = require('./app/models/expense');
const Income = require("./app/models/income");
const Transaction = require('./app/models/transaction');
const Total = require('./app/models/total');

const authRoutes = require('./app/routes/auth');
const budgetRoutes = require('./app/routes/budget');

const sendEmails = require('./app/utils/send-Reports');


// User.findAll({include: Budget}).then(user => {
//     console.log('users',user)
// });

const port = process.env.SERVER_PORT;

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

User.hasMany(Budget);
User.hasMany(Transaction, {foreignKey : 'userId'});
User.hasMany(Income, {foreignKey : 'userId'});
User.hasMany(Expense, {foreignKey : 'userId'});
User.hasMany(Total, {foreignKey : 'userId'});
Budget.belongsTo(User);
Budget.hasMany(Expense);
Expense.belongsTo(Budget)
Budget.hasMany(Income);
Income.belongsTo(Budget)
Transaction.belongsTo(User, {foreignKey: 'userId'});
Expense.belongsTo(User, {foreignKey: 'userId'});
Income.belongsTo(User, {foreignKey: 'userId'});
Total.belongsTo(User, {foreignKey: 'userId'});

app.get('/', (req, res, next) => {
    res.json({message: "welcome"});
});

app.use(authRoutes);
app.use(budgetRoutes);

//use render cronjob to access this endpoint on the first of every month by midnight
app.get('/trigger-cron', (req, res) => {
    sendEmails();
    res.send('sending emails');
})

// const job = schedule.scheduleJob('0 0 1 * *', () => {
//     console.log("Running scheduled job: sending mails");
//     sendEmails();
// });
sequelize.sync().then(result => {
    // console.log(result);
    app.listen(port, () => {
    console.log(`port is running on port ${port}`);
    // sendEmails();
})
}).catch(err => {
    console.log(err);
})
// app.listen(3000, () => {
//     console.log('running');
// });