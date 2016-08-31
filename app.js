'use strict'
//External dependencies
var process = require('process')
var express = require('express')
var expressSession = require('express-session')
var morgan = require('morgan')
var passport = require('passport')
var database = require('./database.js')
var sequelize = require('./database').sequelize
var helmet = require('helmet')
var _ = require('underscore')
var parseArgs = require('minimist')
//Internal dependencies
var models = require('./models.js')
var errors = require('./errors.js')
var config = require('./config.js')
var authRouter = require('./routers/auth')
var apiRouter = require('./routers/api')
var rootRouter = require('./routers/root')

var app = express()

//Set the template engine
app.set('view engine', 'ejs');
app.set('views', './views');

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
if(config.proxyURLSuffix) {
    app.use(`/${config.proxyURLSuffix}/static`, express.static('static'))
} else {
    app.use('/static', express.static('static'))
}


//Routers
if(config.proxyURLSuffix) {
    app.use(`/${config.proxyURLSuffix}/api`, apiRouter);
    app.use(`/${config.proxyURLSuffix}/auth`, authRouter);
    app.use(`/${config.proxyURLSuffix}`, rootRouter); //This one should be specified last because it contains a catch-all route

} else {
    app.use('/api', apiRouter);
    app.use('/auth', authRouter);
    app.use('/', rootRouter); //This one should be specified last because it contains a catch-all route

}

//Get the cmd args
let args = parseArgs(process.argv.slice(2));

//Check if the database is reachable and an admin account/roles exists
sequelize.authenticate().then(function() {
    console.log('Database connection has been established successfully.');
    //Sync all models
    return sequelize.sync();
}).then(function() {
    //Create the admin role if it does not exist
    console.log('Checking admin role...');
    return models.Role.findOrCreate({where: {id: "sixpackadmin"}});
}).then(function() {
    console.log('Checking beeradmin role...');
    return models.Role.findOrCreate({where: {id: "beeradmin"}});
}).then(function() {
    //make sure the admin account exists
    console.log('Checking admin account...')
    return models.User.find({where: {id: 1}, include: [models.UserRole]});
}).then(function(admin) {
    if(admin == null) {
        console.log('WARNING: No admin account exists')
    } else if (args.r) {
        //Reset the admin account
        return admin.destroy().then(function () {
            console.log("Creating default admin account with email ->  admin@admin.com and password -> admin");
            return models.User.create(  {   id: 1, name: 'admin', email: 'admin@admin.com',
                                            userroles: [{userId: 1, roleId: 'sixpackadmin'}],
                                            localprofile: {password: 'admin'}
                                        },
                                        {
                                            include: [models.UserRole, models.LocalProfile]
                                        });
        });
    } else {
        //Check if the primary admin account is still OK
        var currentUserRoles = _.pluck(admin.userroles, 'roleId');
        if(!_.contains(currentUserRoles, 'sixpackadmin')) {
            console.log("WARNING: The primary admin account was not found.")
        }
    }
});

app.listen(config.port, '0.0.0.0');
