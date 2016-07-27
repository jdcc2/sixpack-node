'use strict'

var express = require('express')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var bcrypt = require('bcrypt')
var passport = require('passport')
var BPromise = require('bluebird')
var JWT = require('jwt-async')
var sequelize = require('./database.js').sequelize
var Sequelize = require('sequelize')
var _ = require('underscore')
var models = require('./models.js')
var errors = require('./errors.js')
var controllers = require('./controllers.js')
var ResourceController = require('./controller/ResourceController')
var Response = require('./response.js')
var app = express()
//Router for all api routes
var apiRouter = express.Router()
var router = express.Router()

//Configure JWT
var jwtOptions = {
    crypto: {
        algorithm: 'HS512',
        secret: 'supersecret'
    },
    claims: {
    // Automatically set 'Issued At' if true (epoch), or set to a number
    iat: true,
    // Set 'Not Before' claim (Unix epoch)
    nbf: Math.floor(Date.now() / 1000) - 60,
    // Set 'Expiration' claim (one day)
    exp: Math.floor(Date.now() / 1000) + 3600,
    issuer: 'sixpack'
  }
}

var jwt = BPromise.promisifyAll(new JWT(jwtOptions));

//Add authentication middleware to all api routes
apiRouter.use(function(req, res, next){
    if(req.headers.bearer) {
        jwt.verifyAsync(req.headers.bearer).then(function(data){
            return models.User.findOne({where: {id: data.claims.userId}});
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
});

//Define the crud routes for each resource defined in controllers.js
_.each(controllers, function(controller) {
    if(controller instanceof ResourceController) {
        apiRouter.get(`/${controller.route}/:id`, controller.get.bind(controller));
        apiRouter.post(`/${controller.route}/:id`, controller.post.bind(controller));
        apiRouter.delete(`/${controller.route}/:id`, controller.delete.bind(controller));
        apiRouter.get(`/${controller.route}`, controller.getAll.bind(controller));
        apiRouter.post(`/${controller.route}`, controller.create.bind(controller));
    }
});

//Create the login and signup routes
router.post('/login', function(req, res, next) {
    if(req.body.email && req.body.password) {
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
                return null;
            }
        }).then(function(user){
            return jwt.signAsync({userId: user.id});

        }).then(function(signed) {
            res.json(new Response({jwt: signed}));
        }).catch(function(err){
            next(err);
        });
    } else {
        throw new errors.LoginError('Email or password not supplied in JSON format.');
    }


});


router.all('*', function(res, req, next) {
    next(new errors.ResourceNotFoundError('URL not found'));
})


//Passport middleware
//app.use(passport.initialize());
//Middleware to parse JSON request bodies
app.use(bodyParser.json());
//Request logging
app.use(morgan('combined'));
app.use('/api', apiRouter)
app.use('/', router);
//Middleware to handle basic errors
app.use(function(err, req, res, next) {
    var handled = false;
    console.log(typeof err);
    if(err instanceof Sequelize.ValidationError) {
        res.status(400);
        res.json({ok: false, error: "ValidationError", errorMessage: err.message});
        handled = true;
    } else{
        //Loop over each type of custom error and check if that's the one
        _.each(errors, function(errorClass) {
            if(err instanceof errorClass) {
                res.status(err.status);
                res.json({ok: false, error: err.error, errorMessage: err.message});
                handled = true;
            }
        });
    }




    if(!handled) {
        console.log(err);
        res.status(500);
        res.json({ok: false, error: "UnknownError", message: "An unknown error occurred"});
    }


});

sequelize.authenticate().then(function(err) {
    console.log('Database connection has been established successfully.');
  })
  .catch(function (err) {
    console.log('Unable to connect to the database:', err);
  });

//Sync all models here
sequelize.sync();


app.listen(3000);
