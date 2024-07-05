const express = require('express');
const Router = express.Router();

const budgetController = require("../controllers/budget");
const authController = require("../controllers/auth");

Router.post('/api/create-budget', authController.protectedRoute, budgetController.createBudget);
Router.post('/api/delete-budget', authController.protectedRoute, budgetController.deleteBudget);
Router.get('/api/get-budget/all', authController.protectedRoute, budgetController.getAllBudget);
Router.get('/api/get-budget/current', authController.protectedRoute, budgetController.getCurrentBudget);
Router.get('/api/get-budget/:budget_id', authController.protectedRoute, budgetController.getBudget);
Router.post('/api/create-expense', authController.protectedRoute, budgetController.createExpense);
Router.put('/api/edit-expense/:expense_id', authController.protectedRoute, budgetController.editExpense);
Router.delete('/api/delete-expense/:expense_id', authController.protectedRoute, budgetController.deleteExpense);
Router.get('/api/get-expense/all', authController.protectedRoute, budgetController.getAllExpenses);
Router.get('/api/get-expense/:expense_id', authController.protectedRoute, budgetController.getExpense);
// Router.post('/api/create-income', authController.protectedRoute, budgetController.createIncome);
// Router.post('/api/edit-income/:income_id', authController.protectedRoute, budgetController.editIncome);
// Router.post('/api/delete-income/:income_id', authController.protectedRoute, budgetController.deleteIncome);
Router.get('/api/get-income/all', authController.protectedRoute, budgetController.getAllIncome);
Router.get('/api/get-income/:income_id', authController.protectedRoute, budgetController.getIncome);
Router.post('/api/create-expense-transaction',authController.protectedRoute, budgetController.createExpenseTransaction);
Router.post('/api/create-income-transaction',authController.protectedRoute, budgetController.createIncomeTransaction);
Router.get('/api/get-transactions', authController.protectedRoute, budgetController.getAllTransactions);

module.exports = Router;