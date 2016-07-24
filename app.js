'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('./database.js').sequelize
var Sequelize = require('sequelize')
var _ = require('underscore')
var models = require('./models.js')
var errors = require('./errors.js')
var controllers = require('./controllers.js')
var MultiResourceController = require('./controller/MultiResourceController')
var ResourceController = require('./controller/ResourceController')
// var UserController = require('./controller/UserController.js')
// var UsersController = require('./controller/UsersController.js')
// var ConsumableController = require('./controller/ConsumableController.js')
// var ConsumablesController = require('./controller/ConsumablesController.js')
var app = express();
var router = express.Router()

//Define the crud routes for each resource defined in controllers.js
_.each(controllers, function(controller) {
    if(controller instanceof ResourceController) {
        router.get(`/${controller.route}/:id`, controller.get.bind(controller));
        router.post(`/${controller.route}/:id`, controller.post.bind(controller));
        router.delete(`/${controller.route}/:id`, controller.delete.bind(controller));
    } else if(controller instanceof MultiResourceController) {
        router.get(`/${controller.route}`, controller.get.bind(controller));
        router.post(`/${controller.route}`, controller.post.bind(controller));
    }
});

// //User routes
// router.get('/users/:id', UserController.get);
// router.post('/users/:id', UserController.post);
// router.delete('/users/:id', UserController.delete);
// //Users routers
// router.get('/users', UsersController.get);
// router.post('/users', UsersController.post);
// //Consumable routes
// router.get('/consumables/:id', ConsumableController.get.bind(ConsumableController));
// router.post('/consumables/:id', ConsumableController.post.bind(ConsumableController));
// router.delete('/consumables/:id', ConsumableController.delete.bind(ConsumableController));
// //Consumables routes
// router.get('/consumables', ConsumablesController.get.bind(ConsumablesController));
// router.post('/consumables', ConsumablesController.post.bind(ConsumablesController));
router.all('*', function(res, req, next) {
    next(errors.ResourceNotFound('URL not found'));
})
//Middleware to parse JSON request bodies
app.use(bodyParser.json());
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
