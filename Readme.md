# Monthly Budget Tracker

## Description
The monthly budget tracker is an application that stores and provides updates of a user's income and expenses on a monthly basis.
It's key features include;
- User sign up with email verification
- Password Change
- Budget creation on sign up and subsequently every first day of a month
- Income and expense creation
- Transactions storage
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
coming soon

## Contributing
Guidelines for contributing to the project.
coming soon

## Testing
How to run the tests and test coverage information.
coming soon

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