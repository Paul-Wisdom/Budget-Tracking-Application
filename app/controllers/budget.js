const Budget = require("../models/budget");
const Expense = require("../models/expense");
const Income = require("../models/income");
const User = require("../models/user");

const createBudget = (req, res, next) => {
    const user_id = req.user_id;
    const name = req.body.name;
    const duration = req.body.duration ?  req.body.duration : 30;

    User.findByPk(user_id).then(user => {
        if(!user){
          return res.status(404).send({message: "user not found", error: true});
        }

        return user.createBudget({name:name, duration: duration});
    }).then(result => {
        console.log(result);
        return res.json({message: "created a budget successfully", error: false});
    }).catch(err => {
        console.log(err);
    })

}

const deleteBudget = (req, res, next) => {
    const user_id = req.user_id;
    const budget_id = req.body.budget_id;

    User.findByPk(user_id).then(user => {
        if(!user){
          return res.status(404).send({message: "user not found", error: true});
        }
        return Budget.findOne({where: {id: budget_id, userId: user.id}});
    }).then(budget => {
        if(!budget)
        {
            return res.status(404).send({message: "budget not found", error: true});  
        }

        budget.destroy();
    }).then(result => {
        console.log(result);
        return res.json({message: "Deleted budget successfully", error: false});
    }).catch(err => {
        console.log(err);
    })
};

const getBudget = (req, res, next) => {
    const user_id = req.user_id;
    const budget_id = req.params.budget_id;

    User.findByPk(user_id).then(user => {
        if(!user){
          return res.status(404).send({message: "user not found", error: true});
        }

        return user.getBudgets({where : {id: budget_id}});
    }).then(result => {
        console.log(result);
        return res.json(result);
    }).catch(err => {
        console.log(err);
    })

}

const getAllBudget = (req, res, next) => {
    const user_id = req.user_id;

    User.findByPk(user_id).then(user => {
        if(!user){
          return res.status(404).send({message: "user not found", error: true});
        }
        return user.getBudgets();
    }).then(result => {
        console.log(result);
        return res.json(result);
    }).catch(err => {
        console.log(err);
    })

}
const createExpense = (req, res, next) => {
    const user_id = req.user_id;
    const name = req.body.name;
    const amountBudgeted = req.body.amountBudgeted;
    const amountSpent = 0;
    const budget_id = req.body.budget_id;

    Budget.findOne({where: {id: budget_id, userId: user_id}}).then(budget => {
        if(!budget){
            return res.status(404).send({message: "budget not found", error: true});
          }
        return budget.createExpense({name: name, amountBudgeted: amountBudgeted, amountSpent: amountSpent});
    }).then(result => {
        console.log(result);
        return res.json({message: "created an expense successfully", error: false});
    }).catch(err => {
        console.log(err);
    })

}

const getExpense = (req, res, next) => {
    const user_id = req.user_id;
    const expense_id = req.params.expense_id;
    const budget_id = req.body.budget_id;


    Budget.findOne({where: {id: budget_id, userId: user_id}}).then(budget => {
        if(!budget){
            return res.status(404).send({message: "budget not found", error: true});
          }
        return budget.getExpenses({where :{id : expense_id}});
    }).then(expense => {
        console.log(expense);
        if(!expense)
        {
            return res.json({message: "Expense not found", error: true});
        }
        return res.json(expense);
    }).catch(err => {
        console.log(err);
    })
}
const getAllExpenses = (req, res, next) => {

    const user_id = req.user_id;
    const budget_id = req.body.budget_id;

    Budget.findOne({where: {id: budget_id, userId: user_id}}).then(budget => {
        if(!budget){
            return res.status(404).send({message: "budget not found", error: true});
          }
        return budget.getExpenses();
    }).then(result => {
        console.log(result);
        return res.json(result);
    }).catch(err => {
        console.log(err);
    })
};

const editExpense = (req, res, next) => {

    const user_id = req.user_id;
    const name = req.body.name;
    const amountBudgeted = req.body.amountBudgeted;
    const amountSpent = req.body.amountSpent;
    const expense_id = req.params.expense_id;
    const budget_id = req.body.budget_id;

    Expense.findOne({where: {id: expense_id, budgetId: budget_id}}).then(expense => {
        return expense.set({name: name, amountBudgeted: amountBudgeted, amountSpent: amountSpent})
    }).then(result => {
        result.save();
        console.log(result);
        return res.json(result);
    }).catch(err => {
        console.log(err);
    })
};

const deleteExpense = (req, res, next) => {
    const user_id = req.user_id;
    const expense_id = req.params.expense_id;
    const budget_id = req.body.budget_id;

    Expense.findOne({where: {id: expense_id, budgetId: budget_id}}).then(expense => {
        if(!expense){
            return res.status(404).send({message: "expense not found", error: true});
          };
          return expense.destroy();
    }).then(result => {
        console.log(result);
        return res.json({message: "Deleted expense successfully", error: false});
    }).catch(err => {
        console.log(err);
    })
};

const createIncome = (req, res, next) => {

    const user_id = req.user_id;
    const amount = req.body.amount;
    const name = req.body.name;
    const budget_id = req.body.budget_id;


    Budget.findOne({where: {id: budget_id, userId: user_id}}).then(budget => {
        if(!budget){
            return res.status(404).send({message: "budget not found", error: true});
          }
        return budget.createIncome({name: name, amount: amount});
    }).then(result => {
        console.log(result);
        return res.json({message: "Income created successfully", error: false});
    }).catch(err => {
        console.log(err);
    })
}
const getAllIncome = (req, res, next) => {

    const user_id = req.user_id;
    const budget_id = req.body.budget_id;

    Budget.findOne({where: {id: budget_id, userId: user_id}}).then(budget => {
        if(!budget){
            return res.status(404).send({message: "budget not found", error: true});
          }
        return budget.getIncomes();
    }).then(result => {
        console.log(result);
        return res.json(result);
    }).catch(err => {
        console.log(err);
    })
};

const getIncome = (req, res, next) => {

    const user_id = req.user_id;
    const income_id = req.params.income_id;
    const budget_id = req.body.budget_id;

    Budget.findOne({where: {id: budget_id, userId: user_id}}).then(budget => {
        if(!budget){
            return res.status(404).send({message: "budget not found", error: true});
          }
        return budget.getIncomes({where : {id : income_id}});
    }).then(result => {
        console.log(result);
        return res.json(result);
    }).catch(err => {
        console.log(err);
    })
};

const editIncome = (req, res, next) => {

    const user_id = req.user_id;
    const income_id = req.params.income_id;
    const amount = req.body.amount;
    const name = req.body.name;
    const budget_id = req.body.budget_id;

    Income.findOne({where: {id: income_id, budgetId: budget_id}}).then(income => {
        if(!income){
            return res.status(404).send({message: "income not found", error: true});
          }
        return income.set({name: name, amount: amount})
    }).then(result => {
        result.save();
        console.log(result);
        return res.json(result);
    }).catch(err => {
        console.log(err);
    })
};

const deleteIncome = (req, res, next) => {

    const user_id = req.user_id;
    const income_id = req.params.income_id;
    const budget_id = req.body.budget_id;

    Income.findOne({where: {id: income_id, budgetId: budget_id}}).then(income => {
        if(!income){
            return res.status(404).send({message: "income not found", error: true});
          }
        return income.destroy();
    }).then(result => {
        console.log(result);
        return res.json({message: "Deleted income successfully", error: false});
    }).catch(err => {
        console.log(err);
    })

};

const totalIncomePerBudget = (req, res, next) => {

};

const totalBudgetedPerBudget = (req, res, next) => {

};

const totalSpentPerBudget = (req, res, next) => {

};


module.exports = {
    createBudget,
    deleteBudget,
    getBudget,
    getAllBudget,
    createExpense,
    editExpense,
    deleteExpense,
    getAllExpenses,
    getExpense,
    createIncome,
    getAllIncome,
    getIncome,
    editIncome,
    deleteIncome

}