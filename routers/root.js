var express = require('express')
var config = require('../config')
var auth = require('../authmiddleware')
var errors = require('../errors')

const router = express.Router()

//Protect the root router from unauthenticated requests
router.use(auth.authCheck);

router.get('/', function(req, res) {
    var data = {
        baseURL: config.baseURL
    };
    res.render('index.ejs', data);
});

router.all('*', function(res, req, next) {
    next(new errors.ResourceNotFoundError('URL not found'));
});

module.exports = router;