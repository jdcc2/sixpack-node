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
        res.redirect(`${config.baseURL}/auth/login`)
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






module.exports = {
    authJWT,
    authRouter,
    passport,
    authCheck,
    authCheckAPI
}
