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
var bodyParser = require('body-parser')
var bcrypt = require('bcrypt')
var Response = require('./response.js')
var jwt = BPromise.promisifyAll(new JWT(config.jwtOptions));
var authRouter = express.Router()

var userSessions = {};

function authJWT(req, res, next){
    if(req.headers.bearer) {
        jwt.verifyAsync(req.headers.bearer).then(function(data){
            return models.User.findOne({where: {id: data.claims.userId},
                include: [{ model: models.UserRole,
                            include: [
                                {model: models.Role}
                            ]

            }]});
        }).then(function(user){
            if(user) {
                req.user = user;
                next();
            } else {
                throw new errors.AuthenticationError('User not found');
            }

        }).catch(function(err){
            next(err);
        });
    } else {
        console.log('no bearer')
        next(new errors.AuthenticationError('No JWT found in Bearer HTTP header'));
    }
}

//Create the login and signup routes
authRouter.post('/apilogin', function(req, res, next) {
    if(req.body.email && req.body.password) {
        var uid = null;
        //Find the user based on email
        models.User.findOne({where: {email: req.body.email}}).then(function(user){
            if(user) {
                //Check the password
                return new Promise(function(resolve, reject) {
                    bcrypt.compare(req.body.password, user.password, function(err, res) {
                        if(res) {
                            console.log('login success');
                            resolve(user);
                        } else {
                            throw new errors.LoginError('Email or password not valid');
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
            if (userSessions.hasOwnProperty(uid)) {
                userSessions[uid].push(signed);
            } else {
                userSessions[uid] = [signed];
            }
            console.log(userSessions);
            res.json(new Response({jwt: signed}));
        }).catch(function(err){
            next(err);
        });
    } else {
        throw new errors.LoginError('Email or password not supplied in JSON format.');
    }


});

passport.use('local', new LocalStrategy(function(username, password, done) {
    process.nextTick(function() {
        console.log('whaza')
        models.User.findOne({where: {email: username}}).then(function(user){
            console.log('whut')
            if(user) {
                //Check the password
                return new Promise(function(resolve, reject) {
                    bcrypt.compare(password, user.password, function(err, res) {
                        if(res) {
                            console.log('login success');
                            resolve(user);
                        } else {
                            throw new errors.LoginError('Email or password not valid');
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
            console.log(err);
            return done(null, false, { message: err.reason });
        });
    })

}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    models.User.findById(id).then(function(user) {
        done(null, user);
    }).catch(function(err){
        done(err, null);
    });
});

authRouter.post('/login', bodyParser(), passport.authenticate('local', { successRedirect: '/', failureRedirect: '/auth/login' }));


module.exports = {
    authJWT,
    authRouter,
    passport
}
