var sequelize = require('./database.js').sequelize;
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');
var async = require('asyncawait/async')
var await = require('asyncawait/await')

var models = {
    User : sequelize.define('user', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
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
            },
            beforeUpdate: function(user) {
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
                    console.log('beforeUpdate done')
                    user.password = hash;
                }).catch(function(err) {
                    console.log(err);
                });
            }
        }
    }),
    Consumable: sequelize.define('consumable', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            validate: {
                min: 0
            }
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isAlpha: true
            }
        },
        description: {
            type: Sequelize.STRING,
            allowNull: false,
            defaultValue: ""
        },
        estimatedPrice: {
            type: Sequelize.FLOAT,
            allowNull: false,
            defaultValue: 0.0
        }

    }),
    Consumption: sequelize.define('consumption', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            validate: {
                min: 0
            }
        },
        // time: {
        //     type: Sequelize.DATE,
        //     allowNull: false
        // },
        // userId: {
        //     type: Sequelize.INTEGER
        // }
        amount: {
            type: Sequelize.INTEGER,
            allowNull: false,
            validate: {
                min: 1,
                max: 10
            },
            defaultValue: 1
        },
        closed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    })
}

//Set the relationships
models.Consumption.belongsTo(models.User, {onDelete: 'NO ACTION'});
models.Consumption.belongsTo(models.Consumable, {onDelete: 'NO ACTION'});
models.User.hasMany(models.Consumption);
models.Consumable.hasMany(models.Consumption);


module.exports = models;
