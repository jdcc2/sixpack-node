'use strict'

var fs = require('fs')

var config = {
    jwtOptions : {
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
    },
    googleAuth: {
        clientID: null,
        clientSecret: null,
        enabled: true
    },
    baseURL: null,
    port: 3000,
    database: {
        postgres: false,
        postgresHost: 'sixpackpsql',
	postgresPort: 5432,
        postgresUser: 'sixpack',
        postgresPassword: 'sixpack',
        postgresDatabase: 'sixpack'
    }

};

var defaultUserConfig = {
    jwtSecret: null,
    googleClientID: null,
    googleClientSecret: null,
    baseURL: null,
    port: null,
    postgres: true
};

//TODO implement config schema checking

console.log('Importing config...');
var userconfig = {};
try {
    userconfig = JSON.parse(fs.readFileSync('./config.json', 'utf8'));
} catch(err) {
    console.log('No config file found/read error');
}

Object.assign(defaultUserConfig, userconfig);

if(defaultUserConfig.googleClientID == null || defaultUserConfig.googleClientSecret == null) {
    console.log('WARNING: No valid Google OAuth client ID and/or client secret specified. Google authentication/sign-up will be disabled')
    config.googleAuth.enabled = false;
} else {
    config.googleAuth.clientID = defaultUserConfig.googleClientID;
    config.googleAuth.clientSecret = defaultUserConfig.googleClientSecret;
}

if(defaultUserConfig.jwtSecret == null) {
    console.log('WARNING: Default JWT signing secret is used. This is unsecure')
} else {
    config.jwtOptions.crypto.secret = defaultUserConfig.jwtSecret;
}

if(defaultUserConfig.port == null) {
    console.log('WARNING: using default port number 3000')
} else {
    config.port = defaultUserConfig.port;
}

if(defaultUserConfig.baseURL == null) {
    console.log('WARNING: Using default baseURL http://localhost:[port]')
    config.baseURL = `http://localhost:${config.port}`
} else {
    config.baseURL = defaultUserConfig.baseURL;
}

if(defaultUserConfig.postgres === false) {
    console.log('WARNING: using default local sqlite database sixpackdb.sqlite')
} else {
    console.log('Using PostgreSQL database')
    config.database.postgres = true;
}

console.log(config);

module.exports = config;
