var express = require('express')
var _ = require('underscore')
var models = require('../models.js')
var errors = require('../errors.js')
var config = require('../config.js')
var JWT = require('jwt-async')
var BPromise = require('bluebird')
var passport = require('passport')
var LocalStrategy = require('passport-local')
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt')
var Response = require('../response.js')
var jwt = BPromise.promisifyAll(new JWT(config.jwtOptions));

//PASSPORT
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
            if(user.active) {
                console.log('passport login success');
                return done(null, user);
            } else {
                console.log('local login failed. User not active.')
                return done(null, false);
            }


        }).catch(function(err){
            console.log('passport login error');
            console.log(typeof err);
            return done(null, false, { message: err.reason });
        });
    })

}));

//Only configure Google if enabled/credentials were specified
if(config.googleAuth.enabled) {
    passport.use('google-signup', new GoogleStrategy({
            clientID: config.googleAuth.clientID,
            clientSecret: config.googleAuth.clientSecret,
            callbackURL: `${config.baseURL}/auth/google/signupcb`
        },
        function(token, refreshToken, profile, done) {
            console.log('Google profile')
            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function() {
                console.log('Signup using google strategy')
                // try to find the user based on their google id
                models.GoogleProfile.findOne({where: {id: profile.id}, include: [{ model: models.User }]}).then(function(gp) {
                    if(!gp) {
                        models.User.create({email: profile.emails[0].value,
                                name: profile.displayName,
                                active: false,
                                human: true,
                                googleprofile: {
                                    id: profile.id,
                                    token: token
                                }
                            },
                            {
                                include: [models.GoogleProfile]
                            }).then(function(user) {
                            console.log('signup success');
                            return done(null, user);
                        }).catch(function(err) {
                            return done(err)
                        });
                    } else {
                        return done(null, false);
                    }


                });
            });

        }));

    passport.use('google-login', new GoogleStrategy({
            clientID: config.googleAuth.clientID,
            clientSecret: config.googleAuth.clientSecret,
            callbackURL: `${config.baseURL}/auth/google/logincb`
        },
        function(token, refreshToken, profile, done) {
            console.log('Google profile')
            // make the code asynchronous
            // User.findOne won't fire until we have all our data back from Google
            process.nextTick(function() {
                console.log('Authenticating using google strategy')
                // try to find the user based on their google id
                models.GoogleProfile.findOne({where: {id: profile.id}, include: [{ model: models.User }]}).then(function(gp) {
                    if(gp && gp.user.active) {
                        console.log('Google login success');
                        console.log(gp.user);
                        return done(null, gp.user);
                    } else if(gp) {
                        console.log('Google login failed. User not activated.')
                        return done(null, false);
                    } else {
                        console.log('Google login failed. Google profile not found')
                        return done(null, false);
                    }
                });
            });

        }));
}


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


//ROUTER

const authRouter = express.Router();

if(config.googleAuth.enabled) {
    authRouter.get('/google/login', passport.authenticate('google-login', { scope : ['profile', 'email'] }));
    authRouter.get('/google/logincb',
        passport.authenticate('google-login', {
            successRedirect : `${config.baseURL}`,
            failureRedirect : `${config.baseURL}/auth/login?loginfail=true`
        }));

    authRouter.get('/google/signup', passport.authenticate('google-signup', { scope : ['profile', 'email'] }));
    authRouter.get('/google/signupcb', function(req, res, next) {
        passport.authenticate('google-signup', function(err,user,info) {
            if(err) {
                //Flash a usefull error message
                console.log('google signup failed throug err')
                console.log(err)
                return res.redirect(`${config.baseURL}/auth/login?gsfail=true`)
            }
            if(!user) {
                console.log('google signup failed through unknown reason')
                return res.redirect(`${config.baseURL}/auth/login?gsfail=true`)
            }
            //Flash a success message, informing the user the account needs to be activated
            console.log('google signup success')
            return res.redirect(`${config.baseURL}/auth/login?gsok=true`);
        })(req,res,next);
    });
}





authRouter.get('/login', function(req,res) {
    var data = {
        error: false,
        message: '',
        gauth: config.googleAuth.enabled,
        baseURL: config.baseURL
    };

    if(req.query.gsfail) {
        data.error = true;
        data.message = 'Google Sign-up failed.'
    } else if(req.query.gsok) {
        data.error = true;
        data.message = 'Google Sign-up succeeded. In order to use your account your sign-up request has to be approved. You will receive a message when your account has been approved.'
    } else if(req.query.inactive) {
        data.error = true;
        data.message = 'Your account is not yet activated. Please wait until your account is approved.'
    } else if(req.query.loginfail) {
        data.error = true;
        data.message = 'Login failed. Please make sure you entered a valid email/password combination'
    }
    res.render('login.ejs', data);
});

authRouter.get('/logout', function(req, res) {
    req.logout();
    res.redirect(`${config.baseURL}/auth/login`);
});

authRouter.post('/login', bodyParser.urlencoded(), passport.authenticate('local', { successRedirect: `${config.baseURL}`, failureRedirect: `${config.baseURL}/auth/login?loginfail=true` }));

//Auth router routes
authRouter.post('/apilogin', bodyParser.json(), function(req, res, next) {
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

module.exports = authRouter;