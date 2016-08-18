'use strict'

var express = require('express')
var _ = require('underscore')
var models = require('./models.js')
var errors = require('./errors.js')
var config = require('./config.js')
var JWT = require('jwt-async')
var BPromise = require('bluebird')
var passport = require('passport')
var LocalStrategy = require('passport-local')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt')
var Response = require('./response.js')
var jwt = BPromise.promisifyAll(new JWT(config.jwtOptions));
var authRouter = express.Router()

var userSessions = {};

function authJWT(req, res, next){
    var data = null;
    if(req.headers.bearer) {
        jwt.verifyAsync(req.headers.bearer).then(function(data){
            return models.User.findOne({where: {id: data.claims.userId},
                include: [models.APIToken]});
        }).then(function(user){
            if(user) {
                return models.APIToken.findOne({where: {jwt: req.headers.bearer}, include: [{model: models.User, include: [{ model: models.UserRole,
                            include: [
                                {model: models.Role}
                            ]

            }]}]});
            } else {
                throw new errors.AuthenticationError('User not found');
            }

        }).then(function(apitoken) {
            //TODO check the expiry date
            if(apitoken) {
                req.user = apitoken.user;
                next();
            } else {
                throw new errors.AuthenticationError('Invalid JWT token supplied');
            }


        }).catch(function(err){
            next(err);
        });
    } else {
        next();
    }
}

function authCheck(req, res, next) {
    console.log("Cheking if user authenticated...")
    if(req.user) {
        next();
    } else {
        console.log('redirecting to login')
        res.redirect('/auth/login')
    }
}

function authCheckAPI(req, res, next) {
    console.log("Cheking if user authenticated...")
    if(req.user) {
        next();
    } else {
        console.log('unauthenticated api request')
        throw new errors.AuthenticationError('Authentication required');
    }
}



passport.use('local', new LocalStrategy({usernameField: 'email'}, function(username, password, done) {
    process.nextTick(function() {
        console.log('Authenticating using local strategy');
        models.User.findOne({where: {email: username}, include: [{ model: models.LocalProfile}]}).then(function(user){
            if(user && user.localprofile) {
                //Check the password
                return new Promise(function(resolve, reject) {
                    bcrypt.compare(password, user.localprofile.password, function(err, res) {
                        if(res) {
                            console.log('login success');
                            resolve(user);
                        } else {
                            reject(new errors.LoginError('Email or password not valid'));
                        }

                    });
                });

            } else {
                console.log('wrong user');
                throw new errors.LoginError('Email or password not valid');
            }
        }).then(function(user){
            console.log('passport login success');
            return done(null, user);

        }).catch(function(err){
            console.log('passport login error');
            console.log(typeof err);
            return done(null, false, { message: err.reason });
        });
    })

}));


passport.use('google-signup', new GoogleStrategy(config.googleAuth,
    function(token, refreshToken, profile, done) {
        console.log('Google profile')
        console.log(profile);
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
            console.log('Authenticating using google strategy')
            // try to find the user based on their google id
            models.GoogleProfile.findOne({where: {id: profile.id}, include: [{ model: models.User }]}).then(function(gp) {
                models.User.create({email: profile.emails[0].value,
                                    name: profile.displayName,
                                    activated: false,
                                    human: true,
                                    googleprofile: {
                                        id: profile.id,
                                        token: token
                                    }
                                },
                                {
                                    include: [models.GoogleProfile]
                                }).then(function(user) {
                                    return done(null, user);
                                }).catch(function(err) {
                                    return done(null, err)
                                });

            });
        });

    }));

passport.use('google-login', new GoogleStrategy(config.googleAuth,
    function(token, refreshToken, profile, done) {
        console.log('Google profile')
        console.log(profile);
        // make the code asynchronous
        // User.findOne won't fire until we have all our data back from Google
        process.nextTick(function() {
            console.log('Authenticating using google strategy')
            // try to find the user based on their google id
            models.GoogleProfile.findOne({where: {id: profile.id}, include: [{ model: models.User }]}).then(function(gp) {
                if(gp) {
                    console.log('Google login successr');
                    console.log(gp.user);
                    return done(null, gp.user);
                } else {
                    return done(null, false);
                }
            });
        });

    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    models.User.findById(id, {include: [{ model: models.UserRole,
                include: [
                    {model: models.Role}
                ]

}]}).then(function(user) {
        done(null, user);
    }).catch(function(err){
        done(err, null);
    });
});

//Auth router routes
authRouter.post('/apilogin', function(req, res, next) {
    console.log('apilogin')
    if(req.body.email && req.body.password) {
        var uid = null;
        //Find the user based on email
        models.User.findOne({where: {email: req.body.email}, include: [{ model: models.LocalProfile}]}).then(function(user){
            if(user && user.localprofile) {
                //Check the password
                return new Promise(function(resolve, reject) {
                    bcrypt.compare(req.body.password, user.localprofile.password, function(err, res) {
                        if(res) {
                            console.log('login success');
                            resolve(user);
                        } else {
                            console.log('wrong password')
                            reject(new errors.LoginError('Email or password not valid'));
                        }

                    });
                });

            } else {
                console.log('wrong user');
                throw new errors.LoginError('Email or password not valid');
            }
        }).then(function(user){
            uid = user.id;
            return jwt.signAsync({userId: user.id});

        }).then(function(signed) {
            console.log('uid')
            console.log(uid)
            return models.APIToken.create({jwt: signed, userId: uid, expires: req.params.expires ? new Date(expires) : null});
        }).then(function(apitoken) {
            res.json(new Response({jwt: apitoken.jwt}));
        }).catch(function(err){
            next(err);
        });
    } else {
        next(new errors.LoginError('Email or password not supplied in JSON format.'));
    }


});

authRouter.get('/google/login', passport.authenticate('google-login', { scope : ['profile', 'email'] }));
authRouter.get('/google/logincb',
            passport.authenticate('google-login', {
                    successRedirect : '/',
                    failureRedirect : '/auth/login'
            }));

authRouter.get('/google/signup', passport.authenticate('google-signup', { scope : ['profile', 'email'] }));
authRouter.get('/google/signupcb', function(req, res, next) {
    passport.authenticate('google-signup', function(err,user,info) {
        if(err) {
            //Flash a usefull error message
            return res.redirect('/auth/login');
        }
        if(!user) {
            return res.redirect('/auth/login')
        }
        //Flash a success message, informing the user the account needs to be activated
        return res.redirect('/auth/login');
    })(req,res,next);
});



authRouter.get('/login', function(req,res) {
    res.render('login.ejs');
});

authRouter.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/auth/login');
});

authRouter.post('/login', bodyParser(), passport.authenticate('local', { successRedirect: '/', failureRedirect: '/auth/login' }));


module.exports = {
    authJWT,
    authRouter,
    passport,
    authCheck,
    authCheckAPI
}
