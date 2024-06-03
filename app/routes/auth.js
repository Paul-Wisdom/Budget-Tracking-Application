const express = require('express');

const authController = require('../controllers/auth');

const Router = express.Router();

Router.post('/api/signup', authController.postSignUp);
Router.post('/api/signin', authController.postSignIn);
Router.post('/api/signout', authController.protectedRoute, authController.postSignOut);
Router.get('/api/verify/signup/:id/:uniqueString', authController.getAccountVerification);
Router.get('/api/verify/chpwd/:id/:uniqueString', authController.getPasswordVerification);
Router.post('/api/change-password', authController.postPasswordChange);
Router.post('/test', authController.protectedRoute, (req, res) => {
    console.log(req.user_id);
    res.send({message: "authorized"});
});
module.exports = Router;