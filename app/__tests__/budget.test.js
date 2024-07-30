const supertest = require('supertest');
const jwt = require('jsonwebtoken');

const createServer = require('../utils/createServer');
const getMonth = require('../utils/getMonth');

const User = require('../models/user');
const Budget = require('../models/budget');
const Total = require('../models/total');
const Expense = require('../models/expense');
const Transaction = require('../models/transaction');

const config = require('../config/auth.config');

jest.mock('../models/user', () => {
    
    const User = jest.fn();
    User.hasMany = jest.fn();
    User.findOne = jest.fn();
    User.create = jest.fn();
    User.findByPk = jest.fn();

    return User
});
jest.mock('../models/budget', () => {
    const Budget = jest.fn();
    Budget.findOne = jest.fn();

    return Budget;
});
jest.mock('../models/total', () => {
    const Total = jest.fn();
    Total.findOne = jest.fn();
    Total.create = jest.fn();

    return Total;
});
jest.mock('../models/expense', () => {
    const Expense = jest.fn();
    Expense.findOne = jest.fn();
    Expense.create = jest.fn();

    return Expense;
});
jest.mock('../models/transaction', () => {
    const Transaction = jest.fn();
    Transaction.findOne = jest.fn();
    Transaction.create = jest.fn();

    return Transaction;
});

const app = createServer();

describe("Testing Budget", () => {
    let token;

    beforeAll(() => {
        token = jwt.sign({id: 1},config.secretKey , {expiresIn: '1h'});
    })

    describe("creating budget", () => {
        it("with user not logged in should return 401", async () => {

            const response = await supertest(app).post('/api/create-budget');
            expect(response.status).toBe(401)
        });

        it("with user logged in with no previous budget should return 201", async () => {
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            const mockTotal = {userId: mockUser.id, budgetId: mockBudget.id, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            
            Budget.findOne.mockResolvedValue(null);
            User.findByPk.mockResolvedValue(mockUser);
            const userMock = await User.findByPk();
            userMock.createBudget = jest.fn().mockResolvedValue(mockBudget);
            Total.create.mockResolvedValue(mockTotal);
            const response = await supertest(app).post('/api/create-budget').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(201);
        });

        it("with user logged in with previous budget should return 201", async () => {
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            const mockTotal = {userId: mockUser.id, budgetId: mockBudget.id, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            
            Budget.findOne.mockResolvedValue(mockBudget);
            const budgetMock = await Budget.findOne();
            budgetMock.set = jest.fn().mockResolvedValue({...mockBudget, current: false});
            budgetMock.save = jest.fn().mockResolvedValue('success');
            User.findByPk.mockResolvedValue(mockUser);
            const userMock = await User.findByPk();
            userMock.createBudget = jest.fn().mockResolvedValue({...mockBudget, id:2});
            Total.create.mockResolvedValue(mockTotal);
            const response = await supertest(app).post('/api/create-budget').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(201);
            // const response = await supertest(app).post('/api/create-budget').set('Cookie', `jwt=${token}`);
        });
    })
    describe("Deleting Budget", () => {
        it("with user logged out should return 401", async () => {
            const response = await supertest(app).delete('/api/delete-budget');

            expect(response.status).toBe(401);

        });

        it("with user logged in but no budget id should return 400", async () => {
            // const input = {budget_id: 1};
            // const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            // const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            // User.findByPk.mockResolvedValue(mockUser);
            // Budget.findOne.mockResolvedValue(null);
            const response = await supertest(app).delete('/api/delete-budget').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(400);
        });

        it("with user logged in but budget not existing should return 404", async () => {
            const input = {budget_id: 1};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            
            User.findByPk.mockResolvedValue(mockUser);
            Budget.findOne.mockResolvedValue(null);
            const response = await supertest(app).delete('/api/delete-budget').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(404);

        });

        it("successsfully should return 204", async () => {
            const input = {budget_id: 1};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            
            User.findByPk.mockResolvedValue(mockUser);
            Budget.findOne.mockResolvedValue(mockBudget);
            const budgetMock = await Budget.findOne();
            budgetMock.destroy = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).delete('/api/delete-budget').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(204);
        });
    });
    describe("Getting budgets", () => {
        it("getting multiple should return 200", async () => {
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            User.findByPk.mockResolvedValue(mockUser);
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };

            const userMock = await User.findByPk();
            userMock.getBudgets = jest.fn().mockResolvedValue([mockBudget]);
            const response = await supertest(app).get('/api/get-budget/all').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(200);
        });

        it("getting current budget should return 200", async () => {
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            User.findByPk.mockResolvedValue(mockUser);
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };

            const userMock = await User.findByPk();
            userMock.getBudgets = jest.fn().mockResolvedValue([mockBudget]);
            const response = await supertest(app).get('/api/get-budget/current').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(200);
        });

        it("getting a single budget should return 200", async () => {
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            User.findByPk.mockResolvedValue(mockUser);

            const userMock = await User.findByPk();
            userMock.getBudgets = jest.fn().mockResolvedValue([mockBudget]);
            const response = await supertest(app).get('/api/get-budget/1').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(200);
        });
    });
    describe("creating an expense", () => {
        it("without expense name should return 400", async () => {
            const input = {amountBudgeted: 5000};
            const response = await supertest(app).post('/api/create-expense').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });

        it("without amount budgeted should return 400", async () => {
            const input = {name: "Rent"};
            const response = await supertest(app).post('/api/create-expense').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });

        it("when no current budget can be found should return 404", async () => {
            const input = {name: "Rent", amountBudgeted: 5000};
            Budget.findOne.mockResolvedValue(null);
            const response = await supertest(app).post('/api/create-expense').set('Cookie', `jwt=${token}`).send(input);
            
            expect(response.status).toBe(404);
        });

        it("successfully should return 201", async () => {
            const input = {name: "Rent", amountBudgeted: 5000};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: 1 };
            const mockTotal = {userId: 1, budgetId: mockBudget.id, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            const mockExpense = {name: input.name, amountBudgeted: input.amountBudgeted, amountSpent: 0, userId : 1}
            
            Budget.findOne.mockResolvedValue(mockBudget);
            const budgetMock = await Budget.findOne();
            budgetMock.createExpense = jest.fn().mockResolvedValue(mockExpense);
            Total.findOne.mockResolvedValue(mockTotal);
            const totalMock = await Total.findOne();
            totalMock.set = jest.fn().mockResolvedValue({...mockTotal, totalAmountBudgeted: Number(totalMock.totalAmountBudgeted) + Number(input.amountBudgeted)})
            totalMock.save = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).post('/api/create-expense').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(201);
        });

    });

    describe("Getting expenses", () => {
        it("getting a single expense without budget id should return 400", async () => {

            const response = await supertest(app).get('/api/get-expense/1').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(400);
        });

        it("getting a single expense without budget existing should return 404", async () => {
            // const input = {budget_id: 1};
            Budget.findOne.mockResolvedValue(null);
            const response = await supertest(app).get('/api/get-expense/1?budget_id=1').set('Cookie', `jwt=${token}`)

            expect(response.status).toBe(404);
        });

        it("getting a single expense successfully should return 200", async () => {
            // const input = {budget_id: 1};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: 1 };
            const mockExpense = {name: "Rent", amountBudgeted: 10000, amountSpent: 0, userId : 1}
            
            Budget.findOne.mockResolvedValue(mockBudget);
            const budgetMock = await Budget.findOne();
            budgetMock.getExpenses = jest.fn().mockResolvedValue([mockExpense]);
            const response = await supertest(app).get('/api/get-expense/1?budget_id=1').set('Cookie', `jwt=${token}`)

            expect(response.status).toBe(200);
        });

        it("getting multiple expense without budget id should return 400", async () => {

            const response = await supertest(app).get('/api/get-expense/all').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(400);
        });

        it("getting multiple expense without budget existing should return 404", async () => {
            // const input = {budget_id: 1};
            Budget.findOne.mockResolvedValue(null);
            const response = await supertest(app).get('/api/get-expense/all?budget_id=1').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(404);
        });

        it("getting multiple expense successfully should return 200", async () => {
            // const input = {budget_id: 1};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: 1 };
            const mockExpense = {name: "Rent", amountBudgeted: 10000, amountSpent: 0, userId : 1}
            
            Budget.findOne.mockResolvedValue(mockBudget);
            const budgetMock = await Budget.findOne();
            budgetMock.getExpenses = jest.fn().mockResolvedValue([mockExpense]);
            const response = await supertest(app).get('/api/get-expense/all?budget_id=1').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(200);
        });
    });
    describe("Editing Expense", () => {
        it("without budget id should return 400", async () => {
            const input = {name: "rent", amountBudgeted: 5000};
            const response = await supertest(app).put('/api/edit-expense/1').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });

        it("without amount budgeted should return 400", async () => {
            const input = {name: "rent",budget_id: 1};
            const response = await supertest(app).put('/api/edit-expense/1').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });

        it("when the expense does not exist should return 404", async () => {
            const input = {name: "rent", budget_id: 1, amountBudgeted: 5000};
            Expense.findOne.mockResolvedValue(null);
            const response = await supertest(app).put('/api/edit-expense/1').set('Cookie', `jwt=${token}`).send(input);
            
            expect(response.status).toBe(404);
        });

        it("successfully should return 200", async () => {
            const input = {name: "rent", budget_id: 1, amountBudgeted: 5000};
            const mockExpense = {name: "Rent", amountBudgeted: 3000, amountSpent: 0, userId : 1}
            const mockTotal = {userId: 1, budgetId: 1, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            
            Expense.findOne.mockResolvedValue(mockExpense);
            const expenseMock = await Expense.findOne();
            expenseMock.set = jest.fn().mockResolvedValue({...mockExpense, amountBudgeted: input.amountBudgeted});
            // const expenseSave = await expenseMock.set(); 
            expenseMock.save = jest.fn().mockResolvedValue("success");
            Total.findOne.mockResolvedValue(mockTotal);
            const totalMock = await Total.findOne();
            totalMock.set = jest.fn().mockResolvedValue({...mockTotal})
            const totalSave = await totalMock.set();
            totalSave.save = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).put('/api/edit-expense/1').set('Cookie', `jwt=${token}`).send(input);
            
            expect(response.status).toBe(200);
            expect(Total.findOne).toHaveBeenCalled();
        });
    });
    describe("Deleting expense", () => {
        it("without budget id should return 400", async () => {
            const response = await supertest(app).delete('/api/delete-expense/1').set('Cookie', `jwt=${token}`);
            
            expect(response.status).toBe(400);
        })
        it("when the expense does not exist should return 404", async () => {
            // const input = {budget_id: 1};
            Expense.findOne.mockResolvedValue(null);
            const response = await supertest(app).delete('/api/delete-expense/1?budget_id=1').set('Cookie', `jwt=${token}`);
            
            expect(response.status).toBe(404);
        });
        it("when a transaction has been carried out on the expense server should return 403", async () => {
            // const input = {budget_id: 1};
            // const mockTotal = {userId: 1, budgetId: 1, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            const mockExpense = {name: "Rent", amountBudgeted: 3000, amountSpent: 0, userId : 1}
            const mockTransaction = {name: "Rent", userId: 1, id: 1, type: "expense", amount: 50000, note: "Rent payment"};
            
            Expense.findOne.mockResolvedValue(mockExpense);
            Transaction.findOne.mockResolvedValue(mockTransaction);
            const response = await supertest(app).delete('/api/delete-expense/1?budget_id=1').set('Cookie', `jwt=${token}`);
            
            expect(response.status).toBe(403);
        }); 
        it("when no transaction has been carried out on the expense server should return 204", async () => {
            // const input = {budget_id: 1};
            const mockTotal = {userId: 1, budgetId: 1, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            const mockExpense = {name: "Rent", amountBudgeted: 3000, amountSpent: 0, userId : 1}
            // const mockTransaction = {name: "Rent", userId: 1, id: 1, type: "expense", amount: 50000, note: "Rent payment"};
            
            Expense.findOne.mockResolvedValue(mockExpense);
            Transaction.findOne.mockResolvedValue(null);
            const expenseMock = await Expense.findOne();
            expenseMock.destroy = jest.fn().mockResolvedValue("Success");
            Total.findOne.mockResolvedValue(mockTotal);
            const totalMock = await Total.findOne();
            totalMock.set = jest.fn().mockResolvedValue(mockTotal);
            totalMock.save = jest.fn().mockResolvedValue("success");
            const response = await supertest(app).delete('/api/delete-expense/1?budget_id=1').set('Cookie', `jwt=${token}`);
            
            expect(response.status).toBe(204);
        });    
    });
    describe("Getting Incomes", () => {
        it("getting a single income without budget id should return 400", async () => {

            const response = await supertest(app).get('/api/get-income/1').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(400);
        });

        it("getting a single income without budget existing should return 404", async () => {
            // const input = {budget_id: 1};
            Budget.findOne.mockResolvedValue(null);
            const response = await supertest(app).get('/api/get-income/1?budget_id=1').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(404);
        });

        it("getting a single income successfully should return 200", async () => {
            // const input = {budget_id: 1};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: 1 };
            const mockIncome = {name: "salary", amount: 10000 , userId : 1}
            
            Budget.findOne.mockResolvedValue(mockBudget);
            const budgetMock = await Budget.findOne();
            budgetMock.getIncomes = jest.fn().mockResolvedValue([mockIncome]);
            const response = await supertest(app).get('/api/get-income/1?budget_id=1').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(200);
        });
        it("getting multiple incomes without budget id should return 400", async () => {

            const response = await supertest(app).get('/api/get-income/all').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(400);
        });

        it("getting multiple incomes without budget existing should return 404", async () => {
            // const input = {budget_id: 1};
            Budget.findOne.mockResolvedValue(null);
            const response = await supertest(app).get('/api/get-income/all?budget_id=1').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(404);
        });

        it("getting multiple incomes successfully should return 200", async () => {
            // const input = {budget_id: 1};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: 1 };
            const mockIncome = {name: "salary", amount: 10000 , userId : 1}
            
            Budget.findOne.mockResolvedValue(mockBudget);
            const budgetMock = await Budget.findOne();
            budgetMock.getIncomes = jest.fn().mockResolvedValue([mockIncome]);
            const response = await supertest(app).get('/api/get-income/all?budget_id=1').set('Cookie', `jwt=${token}`);

            expect(response.status).toBe(200);
        });
    });
    describe("Creating Expense transactions", () => {
        it("without expense id  should return 400", async () => {
            const input = { amount: 500, note: "noteeess"};

            const response = await supertest(app).post('/api/create-expense-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });
        it("without amount  should return 400", async () => {
            const input = {expense_id: 1, note: "noteeess"};

            const response = await supertest(app).post('/api/create-expense-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });
        it("without note  should return 400", async () => {
            const input = {expense_id: 1, amount: 500};

            const response = await supertest(app).post('/api/create-expense-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });
        it("with budget not found should return 404", async () => {
            const input = {expense_id: 1, amount: 500, note: "noteeess"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            const mockTotal = {userId: mockUser.id, budgetId: mockBudget.id, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            const mockExpense = {name: "Rent", amountBudgeted: 3000, amountSpent: 0, userId : mockUser.id}
            const mockTransaction = {name: mockExpense.name, userId: mockUser.id, id: 1, type: "expense", amount: 50000, note: "Rent payment"};

            Budget.findOne.mockResolvedValue(null);
            // Expense.findOne.mockResolvedValue(null);

            const response = await supertest(app).post('/api/create-expense-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(404);
        });
        it("with expense not found should return 404", async () => {
            const input = {expense_id: 1, amount: 500, note: "noteeess"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            const mockTotal = {userId: mockUser.id, budgetId: mockBudget.id, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            const mockExpense = {name: "Rent", amountBudgeted: 3000, amountSpent: 0, userId : mockUser.id}
            const mockTransaction = {name: mockExpense.name, userId: mockUser.id, id: 1, type: "expense", amount: 50000, note: "Rent payment"};

            Budget.findOne.mockResolvedValue(mockBudget);
            Expense.findOne.mockResolvedValue(null);

            const response = await supertest(app).post('/api/create-expense-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(404);
            expect(Expense.findOne).toHaveBeenCalledTimes(1);
        });
        it("successfully should return 201", async () => {
            const input = {expense_id: 1, amount: 500, note: "noteeess"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            const mockTotal = {userId: mockUser.id, budgetId: mockBudget.id, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            const mockExpense = {name: "Rent", amountBudgeted: 3000, amountSpent: 0, userId : mockUser.id}
            const mockTransaction = {name: mockExpense.name, userId: mockUser.id, id: 1, type: "expense", amount: 50000, note: "Rent payment"};

            Budget.findOne.mockResolvedValue(mockBudget);
            Expense.findOne.mockResolvedValue(mockExpense);

            const expenseMock = await Expense.findOne();
            expenseMock.set = jest.fn().mockResolvedValue({...mockExpense, amountSpent: mockExpense.amountSpent + input.amount});
            // const expenseSave = await expenseMock.set();
            expenseMock.save = jest.fn().mockResolvedValue("success");
            Total.findOne.mockResolvedValue(mockTotal);
            const totalMock = await Total.findOne();
            totalMock.set = jest.fn().mockResolvedValue(mockTotal);
            const totalSave = await totalMock.set();
            totalSave.save = jest.fn().mockResolvedValue("success");
            Transaction.create.mockResolvedValue(mockTransaction);

            const response = await supertest(app).post('/api/create-expense-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(201);
        })
    });
    describe("creating Income transactions", () => {
        it("without name should return 400", async () => {
            const input = { amount: 500, note: "noteeess"};

            const response = await supertest(app).post('/api/create-income-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });
        it("without amount  should return 400", async () => {
            const input = {name: 1, note: "noteeess"};

            const response = await supertest(app).post('/api/create-income-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });
        it("without note  should return 400", async () => {
            const input = {name: 1, amount: 500};

            const response = await supertest(app).post('/api/create-income-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(400);
        });
        it("with budget not found should return 404", async () => {
            const input = {name: 1, amount: 500, note: "noteeess"};
            Budget.findOne.mockResolvedValue(null);
            // Expense.findOne.mockResolvedValue(null);

            const response = await supertest(app).post('/api/create-income-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(404);
        });
        it("successfully should return 201", async () => {
            const input = {name: 1, amount: 500, note: "noteeess"};
            const mockUser = {name: "john", email: "test@test.com", id: 1, password: "password", verified: true};
            const mockBudget = {id: 1, current: true, month: getMonth(), userId: mockUser.id };
            const mockTotal = {userId: mockUser.id, budgetId: mockBudget.id, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0};
            const mockIncome = {name: "salary", amount: 10000 , userId : mockUser.id}
            const mockTransaction = {name: mockIncome.name, userId: mockUser.id, id: 1, type: "expense", amount: 50000, note: "Rent payment"};

            Budget.findOne.mockResolvedValue(mockBudget);
            
            const budgetMock = await Budget.findOne();
            budgetMock.createIncome = jest.fn().mockResolvedValue(mockIncome);
            Total.findOne.mockResolvedValue(mockTotal);
            const totalMock = await Total.findOne();
            totalMock.set = jest.fn().mockResolvedValue(mockTotal);
            const totalSave = await totalMock.set();
            totalSave.save = jest.fn().mockResolvedValue("success");
            Transaction.create.mockResolvedValue(mockTransaction);

            const response = await supertest(app).post('/api/create-income-transaction').set('Cookie', `jwt=${token}`).send(input);

            expect(response.status).toBe(201);
        })
    })
    describe("Getting transactions", () => {
        it("should return a status of 200 if user is logged in", async () => {
            const mockTransactions = [{name: "salary", userId: 1, id: 6, type: "Income", amount: 6000, note: "salary"},{name: "rent", userId: 1, id: 1, type: "Expense", amount: 500, note: "Rent payment"}]
            Transaction.findAll = jest.fn().mockResolvedValue(mockTransactions)
            const response = await supertest(app).get('/api/get-transactions').set('Cookie', `jwt=${token}`);
            expect(response.status).toBe(200);
        })
    })

    describe("Getting totals", () => {
        it("should return a status of 200 if budgetId is provided", async () => {
            // const mockTransactions = [{name: "salary", userId: 1, id: 6, type: "Income", amount: 6000, note: "salary"},{name: "rent", userId: 1, id: 1, type: "Expense", amount: 500, note: "Rent payment"}]
            const mockTotal = {userId: 1, budgetId: 2, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0}
            Total.findOne.mockResolvedValue(mockTotal)
            const response = await supertest(app).get('/api/get-totals?budgetId=1').set('Cookie', `jwt=${token}`);
            expect(response.status).toBe(200);
        });
        it("should return a status of 400 if budgetId is not provided", async () => {
            // const mockTransactions = [{name: "salary", userId: 1, id: 6, type: "Income", amount: 6000, note: "salary"},{name: "rent", userId: 1, id: 1, type: "Expense", amount: 500, note: "Rent payment"}]
            const mockTotal = {userId: 1, budgetId: 2, totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0}
            Total.findOne.mockResolvedValue(mockTotal)
            const response = await supertest(app).get('/api/get-totals').set('Cookie', `jwt=${token}`);
            expect(response.status).toBe(400);
        })
    })
    describe("Invalid routes", () => {
        it("should return 404", async () => {
            const response = await supertest(app).get('/api/invalidRoute').set('Cookie', `jwt=${token}`);
            expect(response.status).toBe(404);
        })
    })
})