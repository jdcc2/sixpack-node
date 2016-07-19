var sequelize = require('./database.js').sequelize;
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');
var async = require('asyncawait/async')
var await = require('asyncawait/await')

module.exports = {
    User : sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            validate: {
                min: 0
            }
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isAlpha: true
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        email: {
            type: Sequelize.STRING,
            allowNull: false,
            validate: {
                isEmail: true
            }
        },
        active: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,

        },
        human: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true,

        },
        emailValid: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }


    }, {
        hooks: {
            beforeCreate: function(user) {
                return new Promise(function(resolve, reject) {
                    console.log('getting salty');
                    bcrypt.genSalt(10, function(err, salt) {
                        if(err) {
                            console.log('error hashing password');
                            reject(err);
                            //Setting the password to an integer, not string, should cause a validation error
                            //model.setDataValue('password', -1);
                        } else {
                            bcrypt.hash(user.password, salt, function(err, hash) {
                                if(err) {
                                    console.log('error hashing password');
                                    reject(err);
                                    //model.setDataValue('password', -1);
                                } else {
                                    console.log('maxium saltiness achieved')
                                    console.log(hash);
                                    resolve(hash);
                                    //model.setDataValue('password', hash);
                                }

                            });
                        }

                    });

                }).then(function(hash) {
                    console.log('beforeCreate done')
                    user.password = hash;
                }).catch(function(err) {
                    console.log(err);
                });
            }
        }
    })
}
