const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sequelize = require("./app/models/index");
const User = require('./app/models/user');
const Budget = require('./app/models/budget');
const Expense = require('./app/models/expense');
const Income = require("./app/models/income");

const authRoutes = require('./app/routes/auth');
const budgetRoutes = require('./app/routes/budget');

const port = process.env.SERVER_PORT;

const app = express();

app.use(cors());

app.use(express.json());

app.use(express.urlencoded({extended: true}));

User.hasMany(Budget);
Budget.belongsTo(User);
Budget.hasMany(Expense);
Expense.belongsTo(Budget)
Budget.hasMany(Income);
Income.belongsTo(Budget)

app.get('/', (req, res, next) => {
    res.json({message: "welcome"});
});

app.use(authRoutes);
app.use(budgetRoutes);

sequelize.sync().then(result => {
    // console.log(result);
    app.listen(port, () => {
    console.log(`port is running on port ${port}`);
})
}).catch(err => {
    console.log(err);
})
// app.listen(3000, () => {
//     console.log('running');
// });