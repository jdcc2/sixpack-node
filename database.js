Sequelize = require('sequelize')

module.exports = {
    //Define a storage engine to persist the sqlite database
    sequelize : new Sequelize('sixpackdb', null, null, {
        dialect: 'sqlite',
        storage: 'sixpackdb.sqlite'
    })
}
