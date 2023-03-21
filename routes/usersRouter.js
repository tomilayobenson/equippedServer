var express = require('express');
const User = require('../models/user');
const passport = require('passport')
const authenticate = require('../authenticate');
const cors = require('./cors');
var userRouter = express.Router();

/* GET users listing. */
userRouter.get('/', cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    User.find()
        .then(users => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        })
})
userRouter.delete('/:userId', cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.findByIdAndDelete(req.params.userId)
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
})

userRouter.post('/signup', cors.corsWithOptions, (req, res, next) => {
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.json({ err: err });
            } else {
                if (req.body.firstName) {
                    user.firstName = req.body.firstName
                }
                if (req.body.lastName) {
                    user.lastName = req.body.lastName
                }
                if (req.body.role) {
                    user.role = req.body.role
                }
                user.save(err => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ err: err });
                        return;
                    }
                    passport.authenticate('local')(req, res, () => {
                        const token = authenticate.getToken({ _id: req.user._id });
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ success: true, token: token, status: 'Registration Successful! You are now logged in.' });
                    });
                })
            }
        }
    )
});

userRouter.post('/signin', cors.corsWithOptions, passport.authenticate('local'), (req, res, next) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});

userRouter.get('/auth/facebook', cors.cors, passport.authenticate('facebook'))

userRouter.get('/auth/facebook/callback', cors.corsWithOptions, passport.authenticate('facebook', { failureRedirect: '/' }),(req, res) => {
    if (req.user) {
        const token = authenticate.getToken({ _id: req.user._id })
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, token: token, status: 'You are successfully logged in!' });
    }
});

userRouter.get('/logout', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    authenticate.getToken({ _id: req.user._id }, 0)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        success: true,
        status: 'You have successfully logged out!'
    });
})

module.exports = userRouter;
