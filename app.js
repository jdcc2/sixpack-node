'use strict'

var express = require('express')
var expressSession = require('express-session')
var bodyParser = require('body-parser')
var morgan = require('morgan')
var passport = require('passport')
var sequelize = require('./database.js').sequelize
var Sequelize = require('sequelize')
var helmet = require('helmet')
var JWT = require('jwt-async')
var _ = require('underscore')
var models = require('./models.js')
var errors = require('./errors.js')
var controllers = require('./controllers.js')
var config = require('./config.js')
var ResourceController = require('./controller/ResourceController')
var UserController = require('./controller/UserController')
var Response = require('./response.js')
var auth = require('./auth.js')

var app = express()
//Router for all api routes
var apiRouter = express.Router()
var router = express.Router()


//Add authentication middleware to all api routes
apiRouter.use(auth.authJWT);

//Define the crud routes for each resource defined in controllers.js
_.each(controllers, function(controller) {
    if(controller instanceof ResourceController) {
        apiRouter.get(`/${controller.route}/:id`, controller.get.bind(controller));
        apiRouter.post(`/${controller.route}/:id`, controller.post.bind(controller));
        apiRouter.delete(`/${controller.route}/:id`, controller.delete.bind(controller));
        apiRouter.get(`/${controller.route}`, controller.getAll.bind(controller));
        apiRouter.post(`/${controller.route}`, controller.create.bind(controller));
    } else if(controller instanceof UserController) {
        apiRouter.get(`/${controller.route}/:id`, controller.get.bind(controller));
        apiRouter.post(`/${controller.route}/:id`, controller.post.bind(controller));
        apiRouter.delete(`/${controller.route}/:id`, controller.delete.bind(controller));
        apiRouter.get(`/${controller.route}`, controller.getAll.bind(controller));
        apiRouter.post(`/${controller.route}`, controller.create.bind(controller));
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
//Helmet
app.use(helmet.frameguard());
app.use(helmet.noCache());
app.use(helmet.dnsPrefetchControl())

//Passport
app.use(expressSession({'secret' : config.jwtOptions.crypto.secret, name: 'sessionId'}))
app.use(passport.initialize());
app.use(passport.session());
app.use(morgan('dev'));
//Routers
app.use('/api', apiRouter)
app.use('/auth', auth.authRouter)
app.use('/', router);


//Middleware to handle basic errors
app.use(function(err, req, res, next) {
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


});

sequelize.authenticate().then(function() {
    console.log('Database connection has been established successfully.');
    //Sync all models
    return sequelize.sync();
}).then(function() {
    //Create the admin role if it does not exist
    console.log('Creating admin role...');
    return models.Role.findOrCreate({where: {id: "sixpackadmin"}});
}).then(function() {
    //make sure the admin account exists
    console.log('Creating admin account...')
    return models.User.findOrCreate({where: {id: 1, name: "admin", email: 'admin@admin.com'}, defaults: { password: 'admin', userroles: [{userId: 1, roleId: 'sixpackadmin'}]}, include: [models.UserRole]});
}).catch(function(err) {
    console.log('Error accessing database');
    console.log(err);
});




app.listen(3000);
