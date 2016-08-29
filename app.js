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
var APITokenController = require('./controller/APITokenController')
var Response = require('./response.js')
var auth = require('./auth.js')

var app = express()
//Router for all api routes
var apiRouter = express.Router()
var router = express.Router()


//Add authentication middleware to all api routes
apiRouter.use(auth.authJWT);
apiRouter.use(auth.authCheckAPI);
//Add access-control-header to all API calls
apiRouter.use(function(req, res, next) {
    console.log('Settings access-control-header');
    res.set('Access-Control-Allow-Origin', '*');
    next();
});

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
        //NOT '/users/current' does not work as it is mathced by :id in the previous routers
        apiRouter.get('/currentuser', controller.getCurrent.bind(controller));
        apiRouter.post('/createlocaluser', controller.createLocal.bind(controller));
        apiRouter.get(`/${controller.route}`, controller.getAll.bind(controller));
        apiRouter.post(`/${controller.route}`, controller.create.bind(controller));

    } else if(controller instanceof APITokenController) {
        apiRouter.get(`/${controller.route}/:id`, controller.get.bind(controller));
        apiRouter.delete(`/${controller.route}/:id`, controller.delete.bind(controller));
        apiRouter.post(`/${controller.route}`, controller.create.bind(controller));
        apiRouter.get(`/${controller.route}`, controller.getAll.bind(controller));
    }
});

//Protect the root router from unauthenticated requests
router.use(auth.authCheck);

router.get('/', function(req, res) {
    res.render('index.ejs');
});

router.all('*', function(res, req, next) {
    next(new errors.ResourceNotFoundError('URL not found'));
})



//Set the template engine
app.set('view engine', 'ejs');
app.set('views', './views');

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

//Serve static filesi in 'static' dir under '/static'
app.use('/static', express.static('static'))

//Routers
if(config.proxyURLSuffix) {
    app.use(`/${config.proxyURLSuffix}/api`, apiRouter);
    app.use(`/${config.proxyURLSuffix}/auth`, auth.authRouter);
    app.use(`/${config.proxyURLSuffix}`, router); //This one should be specified last because it contains a catch-all route

} else {
    app.use('/api', apiRouter);
    app.use('/auth', auth.authRouter);
    app.use('/', router); //This one should be specified last because it contains a catch-all route

}



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
    console.log('Creating beeradmin role...');
    return models.Role.findOrCreate({where: {id: "beeradmin"}});
}).then(function() {
    //make sure the admin account exists
    console.log('Creating admin account...')
    return models.User.findOrCreate({where: {id: 1},
        defaults: { name: 'admin', email: 'admin@admin.com', userroles: [{userId: 1, roleId: 'sixpackadmin'}], localprofile: {password: 'admin'}},
        include: [models.UserRole, models.LocalProfile]});
}).catch(function(err) {
    console.log('Error accessing database');
    console.log(err);
});




app.listen(config.port, '0.0.0.0');
