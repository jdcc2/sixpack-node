'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('./database.js').sequelize
var models = require('./models.js')
var UserController = require('./controllers/UserController.js')
var UsersController = require('./controllers/UsersController.js')
var ConsumableController = require('./controllers/ConsumableController.js')
var ConsumablesController = require('./controllers/ConsumablesController.js')
console.log(UserController);
var app = express();
var router = express.Router()

//User routes
router.get('/users/:id', UserController.get);
router.post('/users/:id', UserController.post);
router.delete('/users/:id', UserController.delete);
//Users routers
router.get('/users', UsersController.get);
router.post('/users', UsersController.post);
//Consumable routes
router.get('/consumables/:id', ConsumableController.get);
router.post('/consumables/:id', ConsumableController.post);
router.delete('/consumables/:id', ConsumableController.delete);
//Consumables routes
router.get('/consumables', ConsumablesController.get);
router.post('/consumables', ConsumablesController.post);

//Middleware to parse JSON request bodies
app.use(bodyParser.json());
app.use('/', router);
//Middleware to handle basic errors
app.use(function(err, req, res, next) {
  console.log("error occurred");
  console.log(err);
  res.status(err.status);
  res.json({success: false});
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
