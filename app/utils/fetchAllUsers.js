const User = require('../models/user');
const Expense = require('../models/expense');
const Income = require("../models/income");
const Transaction = require('../models/transaction');
const Total = require('../models/total');
const Budget = require('../models/budget');
function fetchUsers() {
        return User.findAll({
          include: [
            { model: Income },
            { model: Expense },
            { model: Transaction },
            { model: Total},
            { model: Budget}
          ]
        })
      .then(users => {
        return users;
      })
      .catch(error => {
        console.error('Unable to fetch all users:', error);
        throw error;
      });
  }
  
  module.exports = fetchUsers;