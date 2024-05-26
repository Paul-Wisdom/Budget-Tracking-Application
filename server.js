const express = require('express');
const cors = require('cors');

const sequelize = require("./app/models/index");
const User = require('./app/models/user');
const Budget = require('./app/models/budget');
const Expense = require('./app/models/expense');
const Income = require("./app/models/income");

const authRoutes = require('./app/routes/auth');
const budgetRoutes = require('./app/routes/budget');

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
    app.listen(3001, () => {
    console.log('port is running on port 3001');
})
}).catch(err => {
    console.log(err);
})
// app.listen(3000, () => {
//     console.log('running');
// });