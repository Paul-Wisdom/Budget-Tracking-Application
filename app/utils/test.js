const fetch = require('./fetchAllUsers');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const getMonth = require('./getMonth');
const month = getMonth();
function createPdf(){
    fetch().then(users => {
        let user = users[0];
        const current_budget = user.budgets.find(b => b.current == true);
  user.incomes = user.incomes.filter(i => i.budgetId == current_budget.id);
  user.expenses = user.expenses.filter(e => e.budgetId == current_budget.id);
  user.total = user.totals.find(t => t.budgetId == current_budget.id)
  const doc = new PDFDocument();
  const filePath = path.join(__dirname, 'reports', `${user.username}_report.pdf`);

  // Ensure the reports directory exists
  if (!fs.existsSync(path.join(__dirname, 'reports'))) {
    fs.mkdirSync(path.join(__dirname, 'reports'));
  }

  doc.pipe(fs.createWriteStream(filePath));
  function paddedStr(text, width, fontSize){
    text = String(text);
    const textWidth = doc.widthOfString(text, {size: fontSize});
    const spaceWidth = doc.widthOfString(' ', {size: fontSize});
    spaceNeeded = Math.floor((width - textWidth) / spaceWidth);
    console.log('text', textWidth, 'spa',spaceWidth, spaceNeeded);
    const paddedText = text + ' '.repeat(spaceNeeded);
    return paddedText;
}
  doc.fontSize(20).text(`${month} Report for ${user.username}`, { align: 'center' });

  doc.fontSize(14).text(`\nINCOMES`);
  doc.text(`${paddedStr('Name', 60, 14)} ${paddedStr('Amount', 60, 14)}`);
  user.incomes.forEach(income => {
    doc.text(`${paddedStr(income.name, 60, 14)} N${paddedStr(income.amount, 60, 14)}`);
  });
  doc.fontSize(14).text(`\nTotal Income: N${user.total.totalIncome}`);

  doc.fontSize(14).text(`\nExpenses:`);
  doc.text(`${paddedStr('Name', 60, 14)} ${paddedStr('Budgeted', 60, 14)} ${paddedStr('Spent', 60, 14)}`);
  user.expenses.forEach(expense => {
    doc.text(`${paddedStr(expense.name, 60, 14)} N${paddedStr(expense.amountBudgeted, 60, 14)} N${paddedStr(expense.amountSpent, 60, 14)}`);
  });
  doc.fontSize(14).text(`\nTotal Amount Budgeted: N${user.total.totalAmountBudgeted}`);
  doc.fontSize(14).text(`\nTotal Amount Spent: N${user.total.totalAmountSpent}`);
  doc.fontSize(14).text(`\nTransactions:`);
  doc.text(`${paddedStr('Name', 60, 14)} ${paddedStr('Amount', 60, 14)} ${paddedStr('Details', 60, 14)}`);
  user.transactions.forEach(transaction => {
    if(transaction.type == 'Income')
        {
            doc.text(`${paddedStr(transaction.name, 60, 14)} +N${paddedStr(transaction.amount, 60, 14)} ${transaction.note}`);
        }
    else{
        doc.text(`${paddedStr(transaction.name, 60, 14)} -N${paddedStr(transaction.amount, 60, 14)} ${transaction.note}`);
    }
  });
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
    }).catch(err => {
        console.log(err);
    })
}

module.exports = createPdf;