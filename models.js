var sequelize = require('./database.js').sequelize;
var Sequelize = require('sequelize');
var bcrypt = require('bcrypt');

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
                is: /^[a-z0-9][a-z0-9 ]+$/i
            }
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
    }),
    LocalProfile: sequelize.define('localprofile', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            validate: {
                min: 0
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false,
        },
        //These foreign keys are created by the function calls below, but constraints on uniqueness are set here
        userId: {
            type: Sequelize.INTEGER,
            unique: true,
            allowNull: false
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
            beforeUpdate: function(user, lala) {
                console.log('before update');
                if(user._changed.password) {
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
    }),
    Role: sequelize.define('role', {
        // id: {
        //     type: Sequelize.INTEGER,
        //     primaryKey: true,
        //     allowNull: false,
        //     autoIncrement: true,
        //     validate: {
        //         min: 0
        //     }
        // },
        id: {
            type: Sequelize.STRING,
            allowNull: false,
            primaryKey: true,
            unique: true,
            validate: {
                isAlpha: true
            }
        }
    }),
    UserRole: sequelize.define('userrole', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            validate: {
                min: 0
            }
        },
        //These foreign keys are created by the function calls below, but constraints on uniqueness are set here
        userId: {
            type: Sequelize.INTEGER,
            unique: true,
            allowNull: false
        },
        roleId: {
            type: Sequelize.STRING,
            uniwue: true,
            allowNull: false
        },

    }),
    GoogleProfile: sequelize.define('googleprofile', {
        id: {
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false
        },
        token : {
            type: Sequelize.STRING,
            allowNull: false
        },
        //These foreign keys are created by the function calls below, but constraints on uniqueness are set here
        userId: {
            type: Sequelize.INTEGER,
            unique: true,
            allowNull: false
        }
    }),
    APIToken: sequelize.define('apitoken', {
        jwt: {
            type: Sequelize.STRING,
            primaryKey: true,
            allowNull: false
        },
        expires: {
            type: Sequelize.DATE,
            allowNull: true
        }
    })
}

//Set the relationships
models.Consumption.belongsTo(models.User, {onDelete: 'NO ACTION'});
models.Consumption.belongsTo(models.Consumable, {onDelete: 'NO ACTION'});
models.User.hasMany(models.Consumption);
models.Consumable.hasMany(models.Consumption);
models.User.hasMany(models.UserRole);
//APITokens and users
models.User.hasMany(models.APIToken);
models.APIToken.belongsTo(models.User, {onDelete: 'CASCADE'});
//The composite unique constraint on userId and roleId is missing
models.UserRole.belongsTo(models.User, {onDelete: 'CASCADE'});
models.UserRole.belongsTo(models.Role, {onDelete: 'NO ACTION'});
models.Role.hasMany(models.UserRole);
//Authentication profiles
models.User.hasOne(models.LocalProfile, {onDelete: 'NO ACTION'});
models.User.hasOne(models.GoogleProfile, {onDelete: 'NO ACTION'});
models.LocalProfile.belongsTo(models.User, {onDelete: 'CASCADE'});
models.GoogleProfile.belongsTo(models.User,{onDelete: 'CASCADE'});


module.exports = models;
