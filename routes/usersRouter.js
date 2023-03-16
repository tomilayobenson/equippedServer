var express = require('express');
var userRouter = express.Router();
const User = require('../models/user');
const passport = require('passport')
const authenticate = require('../authenticate');

/* GET users listing. */
userRouter.get('/', (req, res, next) => {
    User.find()
        .then(users => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        })
})

userRouter.post('/signup', (req, res, next) => {
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

userRouter.post('/signin', passport.authenticate('local'), (req, res, next) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!' });
});

userRouter.get('logout', (req, res, next) => {
    authenticate.getToken({ _id: req.user._id }, 0)
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
        success: true,
        status: 'You have successfully logged out!'
    });
})

module.exports = userRouter;
