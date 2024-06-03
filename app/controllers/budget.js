const Budget = require("../models/budget");
const Expense = require("../models/expense");
const Income = require("../models/income");
const User = require("../models/user");
const Transaction = require("../models/transaction");
const Total = require('../models/total');

const createBudget = (req, res, next) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const user_id = req.user_id;
    const month_id = new Date().getMonth();
    const month = months[month_id];

    Budget.findOne({where: {current: true, userId: user_id}}).then(budget => {
        if(budget)
            {
                 budget.set({current: false});
                 budget.save();
            }
            User.findByPk(user_id).then(user => {
                if(!user){
                  return res.status(404).send({message: "user not found", error: true});
                }        
                return user.createBudget({month:month, current: true});
            }).then(result => {
                console.log(result);
                return Total.create({userId: user_id, budgetId: result.id, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0});
            }).then(result => {
                return res.json({message: "created a budget successfully", error: false});
            }).catch(err => {
                console.log(err);
            })
        
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

const getCurrentBudget = (req, res, next) => {
    const user_id = req.user_id;

    User.findByPk(user_id).then(user => {
        if(!user){
          return res.status(404).send({message: "user not found", error: true});
        }

        return user.getBudgets({where : {current: true}});
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
    let budget_id;

    Budget.findOne({where: {current: true, userId: user_id}}).then(budget => {
        if(!budget){
            return res.status(404).send({message: "budget not found", error: true});
          }
          budget_id = budget.id;
        return budget.createExpense({name: name, amountBudgeted: amountBudgeted, amountSpent: amountSpent});
    }).then(result => {
        console.log(result);
        return Total.findOne({where:{budgetId: budget_id, userId: user_id}});
    }).then(total => {
        total.set({totalAmountBudgeted: Number(total.totalAmountBudgeted) + Number(amountBudgeted)});
        total.save();
    }).then(result => {
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
    // const name = req.body.name;
    const amountBudgeted = req.body.amountBudgeted;
    const expense_id = req.params.expense_id;
    const budget_id = req.body.budget_id;
    let oldAmountBudgeted;
    let response;

    Expense.findOne({where: {id: expense_id, budgetId: budget_id}}).then(expense => {
        if(!expense)
            {
                return res.status(404).send({message: "Expense not found", error: true});
            }
        oldAmountBudgeted = expense.amountBudgeted;
        // let name2 = name ? name : expense.name;
        return expense.set({ amountBudgeted: amountBudgeted})
    }).then(result => {
        result.save();
        console.log(result);
        response = result;
        return Total.findOne({where: {budgetId: budget_id, userId: user_id}});
    }).then(total => {
        return total.set({totalAmountBudgeted: Number(total.totalAmountBudgeted) - Number(oldAmountBudgeted) + Number(amountBudgeted)});
    }).then(result => {
        result.save();
        return res.json(response);
    }).catch(err => {
        console.log(err);
    })
};

const deleteExpense = (req, res, next) => {
    const user_id = req.user_id;
    const expense_id = req.params.expense_id;
    const budget_id = req.body.budget_id;
    let oldAmountBudgeted;

    Expense.findOne({where: {id: expense_id, budgetId: budget_id}}).then(expense => {
        if(!expense){
            return res.status(404).send({message: "expense not found", error: true});
          };
          Transaction.findOne({where: {name: expense.name, userId: user_id}}).then(transaction => {
            if(transaction)
                {
                    return res.json({message: "You cannot carry out this operation", error: true});
                }
                else{
                    oldAmountBudgeted = expense.amountBudgeted;
                    return expense.destroy().then(result => {
                        console.log(result);
                        return Total.findOne({where: {budgetId: budget_id, userId: user_id}});
                    }).then(total => {
                        total.set({totalAmountBudgeted: Number(total.totalAmountBudgeted) - Number(oldAmountBudgeted)});
                        total.save()
                    }).then(result => {
                        return res.json({message: "Deleted expense successfully", error: false});
                    })
                }
          })
    }).catch(err => {
        console.log(err);
    })
};

// const createIncome = (req, res, next) => {

//     const user_id = req.user_id;
//     const amount = req.body.amount;
//     const name = req.body.name;


//     Budget.findOne({where: {current: true, userId: user_id}}).then(budget => {
//         if(!budget){
//             return res.status(404).send({message: "budget not found", error: true});
//           }
//         return budget.createIncome({name: name, amount: amount});
//     }).then(result => {
//         console.log(result);
//         return res.json({message: "Income created successfully", error: false});
//     }).catch(err => {
//         console.log(err);
//     })
// }
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

// const editIncome = (req, res, next) => {

//     const user_id = req.user_id;
//     const income_id = req.params.income_id;
//     const amount = req.body.amount;
//     const name = req.body.name;
//     const budget_id = req.body.budget_id;

//     Income.findOne({where: {id: income_id, budgetId: budget_id}}).then(income => {
//         if(!income){
//             return res.status(404).send({message: "income not found", error: true});
//           }
//         return income.set({name: name, amount: amount})
//     }).then(result => {
//         result.save();
//         console.log(result);
//         return res.json(result);
//     }).catch(err => {
//         console.log(err);
//     })
// };

// const deleteIncome = (req, res, next) => {

//     const user_id = req.user_id;
//     const income_id = req.params.income_id;
//     const budget_id = req.body.budget_id;

//     Income.findOne({where: {id: income_id, budgetId: budget_id}}).then(income => {
//         if(!income){
//             return res.status(404).send({message: "income not found", error: true});
//           }
//         return income.destroy();
//     }).then(result => {
//         console.log(result);
//         return res.json({message: "Deleted income successfully", error: false});
//     }).catch(err => {
//         console.log(err);
//     })

// };

const createExpenseTransaction = (req, res, next) => {
    const user_id = req.user_id;
    const expense_id = req.body.expense_id;
    const amount = req.body.amount;
    const note = req.body.note;
    let transaction_name;
    let budget_id;

    Budget.findOne({where: {current : true, userId: user_id}}).then(budget => {
        if(!budget){
            return res.json({message: "budget not found"});
        }
        budget_id = budget.id;
        return Expense.findOne({where: {id: expense_id, budgetId: budget_id}});
    }).then(expense => {
        if(!expense)
            {
                res.json({message: "Expense not found"});
            }
        transaction_name = expense.name;
        return expense.set({amountSpent: Number(expense.amountSpent) + Number(amount)});
    }).then(result => {
        result.save();
        return Total.findOne({where:{budgetId: budget_id, userId: user_id}});
    }).then(total => {
        return total.set({totalAmountSpent: Number(total.totalAmountSpent) + Number(amount)})
    }).then(total => {
        total.save();
        return Transaction.create({name: transaction_name, amount: amount, note: note, type: "Expense", userId: user_id});
    }).then(result => {
        return res.json(result);
    }).catch(err => {
        console.log(err);
    })
};

const createIncomeTransaction = (req, res,next) => {
    
    const user_id = req.user_id;
    const amount = req.body.amount;
    const name = req.body.name;
    const note = req.body.note;
    let budget_id;

    Budget.findOne({where: {current: true, userId: user_id}}).then(budget => {
        if(!budget){
            return res.status(404).send({message: "budget not found", error: true});
          }
          budget_id = budget.id;
        return budget.createIncome({name: name, amount: amount});
    }).then(result => {
        console.log(result);
        return Total.findOne({where:{budgetId: budget_id, userId: user_id}});
    }).then(total => {
        return total.set({totalIncome: Number(total.totalIncome) + Number(amount)})
    }).then(total => {
        total.save();
        return Transaction.create({name: name, amount: amount, note: note, type: "Income", userId: user_id});
    }).then(result => {
        return res.json(result);
    }).catch(err => {
        console.log(err);
    })
};

// const totalIncomePerBudget = (req, res, next) => {

// };

// const totalBudgetedPerBudget = (req, res, next) => {

// };

// const totalSpentPerBudget = (req, res, next) => {

// };


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
    // createIncome,
    getAllIncome,
    getIncome,
    // editIncome,
    // deleteIncome,
    createIncomeTransaction,
    createExpenseTransaction,
    getCurrentBudget

}