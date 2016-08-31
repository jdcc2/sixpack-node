'use strict';

var JWT = require('jwt-async')
var Sequelize = require('sequelize')
var _ = require('underscore')

function ResourceNotFoundError() {
    Error.captureStackTrace(this, this.constructor);
    this.error = this.constructor.name;
    this.message = 'The requested resource could not be found.'
    this.reason = ""
    this.status = 404;
}

function LoginError(reason) {
    Error.captureStackTrace(this, this.constructor);
    this.error = this.constructor.name;
    this.message = 'The login request failed'
    this.reason = reason ? reason: ""
    this.status = 200;
}

function AuthenticationError(reason) {
    Error.captureStackTrace(this, this.constructor);
    this.error = this.constructor.name;
    this.message = 'Authentication required'
    this.reason = reason ? reason: ""
    this.status = 401;
}

function AuthorizationError(reason) {
    Error.captureStackTrace(this, this.constructor);
    this.error = this.constructor.name;
    this.message = 'Unauthorized';
    this.reason = reason ? reason: "";
    this.status = 401;
}

function apiErrorHandler(err, req, res, next) {
    var handled = false;
    console.log(typeof err);
    if(err instanceof Sequelize.ValidationError) {
        res.status(400);
        res.json({ok: false, error: "ValidationError", errorMessage: err.message});
        handled = true;
    } else if(err instanceof JWT.JWTValidationError) {
        res.status(401);
        res.json({ok: false, error: "JWTValidationError", errorMessage: "JWT token is invalid or expired"});
        handled = true;
    } else {
        //Loop over each type of custom error and check if that's the one
        _.each(errors, function(errorClass) {
            console.log(errorClass);
            console.log(err);
            if(err instanceof errorClass) {
                res.status(err.status);
                res.json({ok: false, error: err.error, errorMessage: err.message, reason: err.reason});
                handled = true;
            }
        });
    }




    if(!handled) {
        console.log(err);
        res.status(500);
        res.json({ok: false, error: "UnknownError", message: "An unknown error occurred"});
    }


}

module.exports = {
    ResourceNotFoundError,
    LoginError,
    AuthenticationError,
    AuthorizationError,
    apiErrorHandler
}
