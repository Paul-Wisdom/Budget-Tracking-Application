require('dotenv').config();

const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransport({
    service: 'gmail', // or any other email service
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS
    }
  });

module.exports = transporter;