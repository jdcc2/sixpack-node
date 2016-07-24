'use strict';

function ResourceNotFoundError() {
    Error.captureStackTrace(this, this.constructor);
    this.error = this.constructor.name;
    this.message = 'The requested resource could not be found.'
    this.status = 404;
}

module.exports = {
    ResourceNotFoundError
}
