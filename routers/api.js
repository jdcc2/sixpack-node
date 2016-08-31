//External dependencies
var express = require('express')
var bodyParser = require('body-parser')
var JWT = require('jwt-async')
var Sequelize = require('sequelize')
var _ = require('underscore')
//Internal dependencies
var auth = require('../authmiddleware')
var errors = require('../errors')
var models = require('../models')
var ResourceController = require('../controller/ResourceController')
var UserController = require('../controller/UserController')
var APITokenController = require('../controller/APITokenController')

const apiRouter = express.Router();

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

let controllers = {
    ConsumableController: new ResourceController('consumables', models.Consumable),
    UserController: new UserController('users', models.User),
    ConsumptionController: new ResourceController('consumptions', models.Consumption),
    RoleController: new ResourceController('roles', models.Role),
    UserRoleController: new ResourceController('userroles', models.UserRole, {acl: {get: ['$owner'], all: ['sixpackadmin']}}),
    APITokenController: new APITokenController('apitokens', models.APIToken),
    LocalProfileController: new ResourceController('localprofile', models.LocalProfile, {acl: {get: ['$owner'], all: ['sixpackadmin']}})
};

//Middleware to parse JSON request bodies
apiRouter.use(bodyParser.json());

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
        //NOTE '/users/current' does not work as it is mathced by :id in the previous routers
        apiRouter.get('/currentuser', controller.getCurrent.bind(controller));
        apiRouter.post('/createlocaluser', controller.createLocal.bind(controller));
        apiRouter.get(`/${controller.route}`, controller.getAll.bind(controller));
        apiRouter.post(`/${controller.route}`, controller.create.bind(controller));
        apiRouter.post(`/${controller.route}/:id/updatepw`, controller.updatePassword.bind(controller))

    } else if(controller instanceof APITokenController) {
        apiRouter.get(`/${controller.route}/:id`, controller.get.bind(controller));
        apiRouter.delete(`/${controller.route}/:id`, controller.delete.bind(controller));
        apiRouter.post(`/${controller.route}`, controller.create.bind(controller));
        apiRouter.get(`/${controller.route}`, controller.getAll.bind(controller));
    }
});

//Middleware to handle basic errors
apiRouter.use(apiErrorHandler);

module.exports = apiRouter;