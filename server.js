require('dotenv').config();
const sendEmails = require('./app/utils/send-Reports');
const sequelize = require("./app/models/index");
const User = require('./app/models/user');
const Budget = require('./app/models/budget');
const Expense = require('./app/models/expense');
const Income = require("./app/models/income");
const Transaction = require('./app/models/transaction');
const Total = require('./app/models/total');

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

const createServer = require('./app/utils/createServer');

const app = createServer();
//use render cronjob to access this endpoint on the first of every month by midnight
app.get('/trigger-cron', (req, res) => {
    sendEmails();
    res.send('sending emails');
})

// const job = schedule.scheduleJob('0 0 1 * *', () => {
//     console.log("Running scheduled job: sending mails");
//     sendEmails();
// });
const port = process.env.SERVER_PORT;
sequelize.sync().then(result => {
    // console.log(result);
    app.listen(port, () => {
    console.log(`port is running on port ${port}`);
    // sendEmails();
})
}).catch(err => {
    console.log(err);
})
