const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('./models/user')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt;
const jwt = require('jsonwebtoken');
const FacebookStrategy = require('passport-facebook').Strategy;
// const config = require('./config')

exports.local = passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()) /*these 2 lines are used with passport sessions as against using web tokens which is used here*/

exports.getToken = function (user) {
    return jwt.sign(user, process.env.SECRET_KEY, { expiresIn: 10800 })
};

exports.jwtPassport = passport.use(
    new JwtStrategy(
        {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.SECRET_KEY
        },
        (jwt_payload, done) => {
            console.log('JWT payload: ', jwt_payload)
            User.findOne({ _id: jwt_payload._id }, (err, user) => {
                if (err) {
                    return done(err, false)
                } else if (user) {
                    return done(null, user)
                } else {
                    return done(null, false)
                }
            })
        }
    )
);

exports.verifyUser = passport.authenticate('jwt', { session: false })

exports.verifyAdmin = (req, res, next) => {
    if (req.user.role.equals("6424a42fcb5d0b4cc628d886")) { //get the admin objectid
        next()
    } else {
        const err = new Error('You are not authorized to perform this operation!')
        err.status = 403
        return next(err)
    }
}

exports.facebookPassport = passport.use(
    new FacebookStrategy(
        {
            clientID: process.env.FACEBOOKCLIENTID,
            clientSecret: process.env.FACEBOOKCLEINTSECRET,
            callbackURL: 'http://localhost:3000/users/auth/facebook/callback',
            profileFields: ['id', 'displayName', 'name', 'gender', 'picture.type(large)','email']
        },
        (accessToken, refreshToken, profile, done)=> {
            console.log("yes i am in here")
            User.findOne({facebookId: profile.id}, (err, user) => {
                if (err) {
                    return done(err, false);
                } else if (user) {
                    return done(null, user);
                } else {
                    user = new User({ username: profile.displayName });
                    user.facebookId = profile.id;
                    user.firstName = profile.name.givenName;
                    user.lastName = profile.name.familyName;
                    user.save((err, user) => {
                        if (err) {
                            return done(err, false);
                        } else {
                            return done(null, user);
                        }
                    });
                }
            })
        }
    )
)

