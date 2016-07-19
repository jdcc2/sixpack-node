'use strict'

var express = require('express');
var bodyParser = require('body-parser');
var sequelize = require('./database.js').sequelize
var models = require('./models.js')
var UserController = require('./controllers/UserController.js')
var UsersController = require('./controllers/UsersController.js')
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
models.User.sync();
// models.User.sync().then(function() {
//     return models.User.create({
//         name: 'PeterPan',
//         email: 'ruk@mail.com',
//         password: 'pw'
//     }).then(function(user) {
//         console.log(user);
//     });
// });


app.listen(3000);
