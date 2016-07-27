'use strict'

module.exports = function(data, status) {
    this.ok = true;
    this.data = data;
    //this.status = status && typeof status === 'number' ? status : 200
}
