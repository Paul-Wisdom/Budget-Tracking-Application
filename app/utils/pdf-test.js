

/**
* You need to install on terminal (node.js):
* -----------------------------------------------------
* $ npm install pdfkit-table
* -----------------------------------------------------
* Run this file:
* -----------------------------------------------------
* $ node index-example.js
* -----------------------------------------------------
*
*/
const fetch = require('./fetchAllUsers');
const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const path = require('path');

const getMonth = require('./getMonth');
const month = getMonth();

async function generatePdf() {
  const users = await fetch();
const user = users[0];
  const current_budget = user.budgets.find(b => b.current == true);
  user.incomes = user.incomes.filter(i => i.budgetId == current_budget.id);
  user.expenses = user.expenses.filter(e => e.budgetId == current_budget.id);
  user.total = user.totals.find(t => t.budgetId == current_budget.id)
  let doc = new PDFDocument({ margin: 30, size: 'A4' });
  const filePath = path.join(__dirname, 'reports', `${user.username}_report.pdf`);

 // Ensure the reports directory exists
 if (!fs.existsSync(path.join(__dirname, 'reports'))) {
  fs.mkdirSync(path.join(__dirname, 'reports'));
}

doc.pipe(fs.createWriteStream(filePath));
doc.fontSize(20).text(`${month} Report for ${user.username}`, { align: 'center' });
const incomeTable = {

  headers: [
    { label:"Name", property: 'name', width: 60, renderer: null },
    { label:"Amount", property: 'amount', width: 70, renderer: null },
  ],
  datas: [],
};
user.incomes.forEach(income => {
  console.log(income);
  incomeTable['datas'].push({name: `${income.name}`, amount: `${income.amount}`});
});

doc.fontSize(14).text('Income')
doc.moveDown(1);
doc.table(incomeTable);


const expenseTable = {

  headers: [
    { label:"Name", property: 'name', width: 60, renderer: null },
    { label:"Amount Budgeted", property: 'amountB', width: 100, renderer: null },
    { label:"Amount Spent", property: 'amountS', width: 70, renderer: null },
  ],
  datas: [],
};
user.expenses.forEach(expense => {
  expenseTable['datas'].push({name: `${expense.name}`, amountB: `${expense.amountBudgeted}`, amountS: `${expense.amountSpent}`});
});

doc.text('Expense')
doc.moveDown(1);
doc.table(expenseTable);

const transactionTable = {

  headers: [
    { label:"Name", property: 'name', width: 60, renderer: null },
    { label:"Amount", property: 'amount', width: 70, renderer: null },
    { label:"Details", property: 'details', width: 150, renderer: null },
  ],
  datas: [],
};
user.transactions.forEach(t=> {
  if(t.type != 'Income')
    {
      transactionTable['datas'].push({name: `${t.name}`, amount: `-${t.amount}`, details: `${t.note}`});
    }
    else{
  transactionTable['datas'].push({name: `${t.name}`, amount: `+${t.amount}`, details: `${t.note}`});
    }
});

doc.text('Transactions')
doc.moveDown(1);
doc.table(transactionTable);

const saved = Number(user.total.totalIncome) - Number(user.total.totalAmountSpent);
if (saved > 0)
  {
      doc.fontSize(14).text(`\nSaved: +N${saved}`);
  }
  else{
      doc.fontSize(14).text(`\nDeficit: -N${saved}`);
  }

doc.end();
return filePath;
}

module.exports = generatePdf;

