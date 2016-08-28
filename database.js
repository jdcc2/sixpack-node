Sequelize = require('sequelize')
config = require('./config.js').database

var sequelize = null;
if(config.postgres) {
    sequelize =  new Sequelize(`postgres://${config.postgresUser}:${config.postgresPassword}@${config.postgresHost}:${config.postgresPort}/${config.postgresDatabase}`);
} else {
    sequelize = new Sequelize('sixpackdb', null, null, {
        dialect: 'sqlite',
        storage: 'sixpackdb.sqlite',
        logging: false
    });
}

module.exports = {
    //Define a storage engine to persist the sqlite database
    sequelize

}
