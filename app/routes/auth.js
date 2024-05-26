const express = require('express');

const authController = require('../controllers/auth');

const Router = express.Router();

Router.post('/api/signup', authController.postSignUp);
Router.post('/api/signin', authController.postSignIn);
Router.post('/api/signout', authController.protectedRoute, authController.postSignOut);
Router.post('/api/verify/:id/:uniqueString', authController.postVerification);
Router.post('/test', authController.protectedRoute, (req, res) => {
    console.log(req.user_id);
    res.send({message: "authorized"});
});
module.exports = Router;