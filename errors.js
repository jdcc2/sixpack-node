'use strict';

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
    this.reason = reason
    this.status = 200;
}

function AuthenticationError(reason) {
    Error.captureStackTrace(this, this.constructor);
    this.error = this.constructor.name;
    this.message = 'Authentication required'
    this.reason = reason
    this.status = 401;
}

module.exports = {
    ResourceNotFoundError,
    LoginError,
    AuthenticationError
}
