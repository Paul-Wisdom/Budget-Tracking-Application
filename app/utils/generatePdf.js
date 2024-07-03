const PDFDocument = require('pdfkit-table');
const fs = require('fs');
const path = require('path');

const getMonth = require('./getMonth');
const month = getMonth();

/*
 * helper function for drawing tables 
 */
function drawTable(doc, text, table){
  doc.fontSize(14).text(text);
  doc.moveDown(1);
  doc.table(table);
}

/*
 * function generates pdf for a user containing income, expenses and transactions for a month
 */
function generatePdf(user) {
  const current_budget = user.budgets.find(b => b.current == true);
  user.incomes = user.incomes.filter(i => i.budgetId == current_budget.id);
  user.expenses = user.expenses.filter(e => e.budgetId == current_budget.id);
  user.total = user.totals.find(t => t.budgetId == current_budget.id)
  let doc = new PDFDocument({ margin: 30, size: 'A4' });
  const filePath = path.join(__dirname, 'reports', `${user.username}_report.pdf`);

  //defining table format
  const incomeTable = {
    headers: [
      { label:"Name", property: 'name', width: 60, renderer: null },
      { label:"Amount", property: 'amount', width: 70, renderer: null },
    ],
    datas: [],
  };
  const expenseTable = {
    headers: [
      { label:"Name", property: 'name', width: 60, renderer: null },
      { label:"Amount Budgeted", property: 'amountB', width: 100, renderer: null },
      { label:"Amount Spent", property: 'amountS', width: 70, renderer: null },
    ],
    datas: [],
  };
  const transactionTable = {
    headers: [
      { label:"Name", property: 'name', width: 60, renderer: null },
      { label:"Amount", property: 'amount', width: 70, renderer: null },
      { label:"Details", property: 'details', width: 150, renderer: null },
    ],
    datas: [],
  };

  //Populating tables
  user.incomes.forEach(income => {
    console.log(income);
    incomeTable['datas'].push({name: `${income.name}`, amount: `${income.amount}`});
  });
  user.expenses.forEach(expense => {
    expenseTable['datas'].push({name: `${expense.name}`, amountB: `${expense.amountBudgeted}`, amountS: `${expense.amountSpent}`});
  });
  user.transactions.forEach(t=> {
    if(t.type != 'Income')
      {
        transactionTable['datas'].push({name: `${t.name}`, amount: `-${t.amount}`, details: `${t.note}`});
      }
    else{
      transactionTable['datas'].push({name: `${t.name}`, amount: `+${t.amount}`, details: `${t.note}`});
    }
  });

 // Ensure the reports directory exists
 if (!fs.existsSync(path.join(__dirname, 'reports'))) {
    fs.mkdirSync(path.join(__dirname, 'reports'));
  }

  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(20).text(`${month} Report for ${user.username}`, { align: 'center' });
 
  //drawing tables
  drawTable(doc, 'Income', incomeTable);
  drawTable(doc, 'Expense', expenseTable);
  drawTable(doc, 'Transaction', transactionTable);
  
  const saved = Number(user.total.totalIncome) - Number(user.total.totalAmountSpent);
  if (saved >= 0)
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

