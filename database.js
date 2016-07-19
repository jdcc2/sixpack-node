Sequelize = require('sequelize')

module.exports = {
    //Define a storage engine to persist the sqlite database
    sequelize : new Sequelize('sqlite:///testdb.sqlite')
}
