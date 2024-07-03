const fetchUsers = require('./fetchAllUsers');
const generatePdf = require('./generatePdf');
const getMonth = require('./getMonth');

const fs = require('fs');
const path = require('path');

const Transaction = require('../models/transaction');
const Budget = require('../models/budget');
const Total = require('../models/total');

const month = getMonth();
const transporter = require('../utils/nodemailer-transporter');

/*
 * Sends mail to a single user
 */
function sendEmail(user, transporter) {
  const pdfPath = generatePdf(user);

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: user.email,
    subject: `Report for the month of ${month}`,
    text: `Dear ${user.username},\n\nHere is a customized report for you based on your budget...\n\nBest regards,\nBudget Tracking team`,
    attachments: [
      {
        filename: `${user.username}_report.pdf`,
        path: pdfPath,
        contentType: 'application/pdf'
      }
    ]
  };

  return transporter.sendMail(mailOptions)
    .then(info => {
      console.log(`Email sent to ${user.email}: ${info.response}`);
      return pdfPath;
    }).then(path => {
        fs.unlink(path, (err) => {
            if(err) throw err;
            else{
                console.log('file deleted');
            }
        })
    })
    .catch(error => {
      console.error(`Error sending email to ${user.email}:`, error);
      throw error;
    });
}

/*
 * Sends mail to all users in db
 */
function sendEmails() {
  let allUsers;
  let curr_user;
  fetchUsers()
    .then(users => {
      allUsers = users;
      const emailPromises = users.map(user => sendEmail(user, transporter));
      return Promise.all(emailPromises);
    })
    .then(pdfPaths => {
      console.log('All emails sent successfully.');
      return Transaction.destroy({ where: {}, truncate: true });
    })
    .then(() => {
      console.log('Transaction table cleared successfully.');

      return Budget.update({current: false}, {where : {}})
    }).then(result => {
      const userPromise = allUsers.map(user => {
        // curr_user = user;
        user.createBudget({current: true, month: month}).then(result => {
          console.log(result);
          user.createTotal({budgetId: result.id,  totalAmountBudgeted: 0, totalAmountSpent: 0, totalIncome: 0})
        })});
      return Promise.all(userPromise);
    }).then(result => {
      console.log("Finally, All done")
    }).catch(error => {
      console.error('Error during email sending process:', error);
    });
}

module.exports = sendEmails;