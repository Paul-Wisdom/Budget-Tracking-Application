# Monthly Budget Tracker

## Description
The monthly budget tracker is an application that stores and provides updates of a user's income and expenses on a monthly basis.
It's key features include;
- User sign up with email verification
- Password Change
- Budget creation on sign up and subsequently at beginning of a new month
- Income and expense creation
- Transactions storage
- Display of income and expenses in Pie, Doughnut and Bar Charts
- Generation of budget statements including all entered transactions, income, expenses and charts in a PDF     sent to user's mail 

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Testing](#testing)
- [Deployment](#deployment)
- [Built With](#built-with)
- [Acknowledgments](#acknowledgments)
- [License](#license)
- [Contact Information](#contact-information)

## Installation
### Prerequisites
To run this application, you must have Nodejs installed on your system. You also need to have MYSQL
- [click to download Nodejs](https://nodejs.org/en/download/package-manager)
- [click to download MYSQL](https://www.mysql.com/downloads/)
### Installation guide
- Clone the repository with `git clone https://github.com/Paul-Wisdom/Budget-Tracking-Application.git`
- Open the repository locally and navigate to the root directory
- Install the dependencies using `npm install`
- Start the server with `npm run start`

## Usage
coming soon

## Configuration
The Project has a number of configurable environmental variables which can be found in the .env.example file at the root of the project. The variables are;
- ### AUTH_EMAIL
This is the email from which all emails to be sent to the application users originate from i.e source mail.
This should be a gmail account as the service used in sending the emails is gmail.
- ### AUTH_PASS
This is the app password for the source email account. 
- ### DB
This is the name of the database Schema
- ### DB_USER
This is the name of the database User
- ### DB_PASS
This is the password of the database
- ### DB_PORT
This is the port on which the database is run
- ### DB_HOST
This is the host on which the database is run. It is an optional variable as it is only to be set when running the application in production mode. It's default value is 'localhost'
- ### ENV
This is another optional variable. It is the mode which the application is run it's dafault value is "development" 
- ### URL
This is also an optional environmental variable required when the application is running in production mode. It is the base url of the server. Its default value is "http://localhost:"
- ### JWT_SCR_KEY
This is the secret string used to hash the application's JSON Web Tokens.
- ### SERVER_PORT
This is the port on which the application's server is being run on your machine.

## API Documentation
List of API endpoints with details.
### AUTH ENDPOINTS
These are endpoints used in the process of creating, authenticating and logging in of user accounts.
Endpoints with `[PROTECTED]` require the user to be logged In.
- #### POST `/api/signup`
Endpoint for user sign up. It receives three (3) body parameters, The user's name, email and password.
On successful sign up, a mail is sent to the email with a link for account verification which will expire in six (6) hours.
##### Status Codes and Possible Causes
1. 400 
- Body parameter `name` not provided.
- Body parameter `email` not provided.
- Body parameter `password` not provided.
2. 409
- The `name` provided is already in use
- The `email` provided is already in use
3. 200
- Account created successfully and verification link sent to email
- #### GET `/api/verify/signup/:id/:uniqueString`
Endpoint for verifying user sign up. It is sent to the email submitted by the user during signup.
##### Status Codes and Possible Causes
1. 404
- Account does not exist or has been verified already
2. 403
- The verification link has expired
3. 401
- Invalid link
4. 500
- Internal Server Error
5. 200
- Account verification successful
- #### POST `/api/signin`
Endpoint for user sign in. It receives two (2) body parameters, The user's email and password. The user has to be verified for successful login operation.
##### Status Codes and Possible Causes
1. 400 
- Body parameter `email` not provided.
- Body parameter `password` not provided.
2. 401
- Wrong `email` or `password` provided.
3. 403
- User not verified
4. 200
- Sign In successful
- #### POST `/api/signout` PROTECTED
Endpoint for user sign out.
##### Status Codes and Possible Causes
1. 200
- Sign Out successful
- #### POST `/api/change-password`
Endpoint for changing the user accunt's password. It receives two (2) body parameters, The user's email and the new password. In order to process a password change, a mail is sent to the email with a link for account verification which will expire in six (6) hours.  The user has to be verified in order to change password.
##### Status Codes and Possible Causes
1. 400 
- Body parameter `email` not provided.
- Body parameter `newPassword` not provided.
2. 404
- Account Does not exist
3. 403
- User not verified
4. 200
- Link for password change sent to email
- #### GET `/api/verify/chpwd/:id/:uniqueString`
Endpoint for verifying password change action. It is sent to the user's mail upon a request to change password.
##### Status Codes and Possible Causes
1. 404
- Account does not exist or password changed
2. 403
- The verification link has expired
3. 401
- Invalid link
4. 500
- Internal Server Error
5. 200
- Account verification successful

### BUDGET ENDPOINTS
This is a list of all endpoints associated with the process of CRUD operations on budgets, expenses, incomes and transactions. Endpoints with `PROTECTED` require the user to be logged In.
- #### POST `/api/create-budget` PROTECTED
Endpoint for creating a new budget for signed in user.
##### Status Codes and Possible Causes
1. 404
- User not found.
2. 201
- Budget created successfully.
- #### DELETE `/api/delete-budget` PROTECTED
Endpoint for deleting a budget. It receives a body parameter `budget_id`.
##### Status Codes and Possible Causes
1. 400 
- Body parameter `budget_id` not provided.
2. 404
- User not found
- Budget not found
3. 204
- Budget deleted successfully
- #### GET `/api/get-budget/all` PROTECTED
Endpoint for getting all budget associated with a signed in user.
##### Status Codes and Possible Causes
1. 404
- User not found.
2. 200
- Successful request
- #### GET `/api/get-budget/current` PROTECTED
Endpoint for getting details on the signed in user's current budget.
##### Status Codes and Possible Causes
1. 404
- User not found.
2. 200
- Successful request
- #### GET `/api/get-budget/:budget_id` PROTECTED
Endpoint for getting details of a budget with provided budget_id.
##### Status Codes and Possible Causes
1. 404
- User not fpund.
2. 200
- Successful request
- #### POST `/api/create-expense` PROTECTED
Endpoint for creating an expense associated with the signed in user's current budget. It receives two (2) body parameters `name` and `amountBudgeted`
##### Status Codes and Possible Causes
1. 400
- Body parameter `name` not provided
- Body parameter `amuntBudgeted` not provided
2. 404
- Budget not found.
3. 201
- Created Expense successfully
- #### PUT `/api/edit-expense/:expense_id` PROTECTED
Endpoint for editting expense with provided expense_id. It also receives body parameters `name`, `amountBudgeted` and `budget_id`.
##### Status Codes and Possible Causes
1. 400
- Body parameters `name`, `amountBudgeted`, or `budget_id` not provided
2. 404
- Expense not found.
3. 200
- Expense editted successfully
- #### DELETE`/api/delete-expense/:expense_id` PROTECTED
Endpoint for deleting expense with provided expense_id. It also receives a query parameter `budget_id`.
##### Status Codes and Possible Causes
1. 400
- Query parameter `budget_id` not provided
2. 404
- Expense not found.
3. 403
- A transaction has been carried on on the expense, thus it cannot be deleted.
3. 200
- Successful request
- #### GET `/api/get-expense/all` PROTECTED
Endpoint for getting all expenses associated with a signed in user's current budget. It also receives a query parameter `budget_id`
##### Status Codes and Possible Causes
1. 400
- Query parameter `budget_id` not provided
2. 404
- Budget not found.
3. 200
- Successful request
- #### GET `/api/get-expense/:expense_id` PROTECTED
Endpoint for getting details on expense with provided expense_id. It also receives a query parameter `budget_id`
##### Status Codes and Possible Causes
1. 400
- Query parameter `budget_id` not provided
2. 404
- Budget not found.
3. 200
- Successful request
- #### GET `/api/get-income/all` PROTECTED
Endpoint for getting all income associated with a signed in user's current budget. It also receives a `budget_id` query parameter
##### Status Codes and Possible Causes
1. 400
- Query parameter `budget_id` not provided
2. 404
- Budget not found.
3. 200
- Successful request
- #### GET `/api/get-income/:income_id` PROTECTED
Endpoint for getting details on income with provided income_id. A query paramer `budget_id` is also required.
##### Status Codes and Possible Causes
1. 400
- Query parameter `budget_id` not provided
2. 404
- Budget not found.
3. 200
- Successful request
- #### POST `/api/create-expense-transaction` PROTECTED
Endpoint for creating an expense transaction. It also requires body parameters `expense_id`, `amount` and `note`
##### Status Codes and Possible Causes
1. 400
- Body parameter `expense_id`, `amount` or `note` not provided
2. 404
- Budget not found.
- Expense not found
3. 201
- Expense transaction created successfully
- #### POST `/api/create-income-transaction` PROTECTED
Endpoint for creating an income transaction. It also requires body parameters `name`, `amount` and `note`
##### Status Codes and Possible Causes
1. 400
- Body parameter `name`, `amount` or `note` not provided
2. 404
- Budget not found.
3. 201
- Income transaction created successfully
- #### GET `/api/get-transactions` PROTECTED
Endpoint for getting all transactions associated with the signed in user.
##### Status Codes and Possible Causes
1. 200
- Successful request

- #### GET `/api/get-totals` PROTECTED
Endpoint for getting the totals of all incomes, amount budgeted and amount spent of expenses associated with the logged in user's current budget. It receives a `budgetId` query parameter.
##### Status Codes and Possible Causes
1. 200
- Successful request
2. 400
- Query parameter `budgetId` not provided.  
### PROTECTED ENDPOINTS
A status code of `401` may arise due to the one of the following reasons for a PROTECTED endpoint
1. There was no token passed with the request
2. An Invalid token was passed with the request.
## Contributing
Guidelines for contributing to the project.
coming soon

## Testing
This application uses jest and supertest for unit and end to end tests.
You can test the application with the command `npm run test`

## Deployment
Instructions on how to deploy the project.
coming soon

## Built With
- Express
- Mysql
- Nodemailer
- Node-schedule
- Bcryptjs
- Sequelize
- JSON Web Tokens

## Acknowledgments
Credits and links to resources.
coming soon

## License
Information about the license.
coming soon

## Contact Information
[X formerly(twitter)](https://x.com/patch01010?t=8NSsYoaLyq3oWmBcrWJTJA&s=09)
[LinkedIn](https://www.linkedin.com/in/paul-wisdom-03710b254/)