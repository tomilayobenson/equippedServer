var express = require('express');
const User = require('../models/user');
const passport = require('passport');
const Role = require('../models/roles')
const authenticate = require('../authenticate');
const cors = require('./cors');
var userRouter = express.Router();

/* GET users listing. */
userRouter.options('/',cors.corsWithOptions, (req, res) => {
        res.sendStatus(200)
    })
userRouter.get('/', cors.corsWithOptions,authenticate.verifyUser, (req, res, next) => {
    User.find()
    .populate('role')
        .then(users => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        })
})
userRouter.options('/:userId',cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
userRouter.delete('/:userId', cors.corsWithOptions,authenticate.verifyUser, authenticate.verifyAdmin, (req, res, next) => {
    User.findByIdAndDelete(req.params.userId)
        .then(response => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(response);
        })
})

userRouter.options('/signup',cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})

userRouter.post('/signup', cors.corsWithOptions, (req, res, next) => { //for only vendors as role is assigned here
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
                user.role = "6424a43acb5d0b4cc628d887";
                if (req.body.role) {
                    user.role = req.body.role
                }
                if (req.body.email) {
                    user.email = req.body.email
                }
                if (req.body.address) {
                    user.address = req.body.address
                }
                if (req.body.address2) {
                    user.address2 = req.body.address2
                }
                if (req.body.city) {
                    user.city = req.body.city
                }
                if (req.body.state) {
                    user.state = req.body.state
                }
                if (req.body.zip) {
                    user.zip = req.body.zip
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
                        res.json({ success: true, token: token, status: 'Registration Successful! You are now logged in.', user: req.user });
                    });
                })
            }
        }
    )
});

userRouter.options('/signin',cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
userRouter.post('/signin', cors.corsWithOptions, passport.authenticate('local'), (req, res, next) => {
    const token = authenticate.getToken({ _id: req.user._id });
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, token: token, status: 'You are successfully logged in!',user: req.user });
});

userRouter.options('/auth/facebook',cors.cors, (req, res) => {
    res.sendStatus(200)
})
userRouter.get('/auth/facebook', cors.cors, passport.authenticate('facebook'))

userRouter.options('/auth/facebook/callback',cors.cors, (req, res) => {
    res.sendStatus(200)
})
userRouter.get('/auth/facebook/callback', cors.corsWithOptions, passport.authenticate('facebook', { failureRedirect: '/' }),(req, res) => {
    if (req.user) {
        const token = authenticate.getToken({ _id: req.user._id })
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, token: token, status: 'You are successfully logged in!', user: req.user });
    }
});

userRouter.options('/checkJWTtoken',cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
userRouter.get('/checkJWTtoken', cors.corsWithOptions, (req, res) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) {
            return next(err);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        if (!user) {
            return res.json({ status: 'JWT invalid!', success: false, err: info });
        } else {
            return res.json({ status: 'JWT valid!', success: true, user: user });
        }
    })(req, res);
});

userRouter.options('/logout',cors.corsWithOptions, (req, res) => {
    res.sendStatus(200)
})
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
