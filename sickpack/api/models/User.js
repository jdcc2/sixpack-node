/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var bcrypt = require('bcrypt');

module.exports = {

  attributes: {
      id:   {
          type: 'integer',
          primaryKey: true,
          autoIncrement: true
      },
      name: {
          type: 'string',
          required: true,
          notNull: true,
          unique: true
      },
      email: {
          type: 'string',
          required: true,
          unique: true,
          notNull: true,
          email: true
      },
      password: {
          type: 'string',
          notNull: true,
          required: true
      },
      active: {
          type: 'boolean',
          required: true,
          notNull: true,
          defaultsTo: true
      },
      human: {
          type: 'boolean',
          required: true,
          notNull: true,
          defaultsTo: true
      },
      emailValidated: {
          type: 'boolean',
          required: true,
          notNull: true,
          defaultsTo: false
      },
      roles: {
          collection: 'role',
          via: 'users',
          dominant: true
      },
      consumptions: {
          collection: 'consumption',
          via: 'user'
      }

  },
  beforeCreate: function(user, cb) {
      bcrypt.genSalt(10, function(err, salt) {
            bcrypt.hash(user.password, salt, function(err, hash) {
                if (err) {
                    console.log(err);
                    cb(err);
                } else {
                    user.password = hash;
                    cb();
                }
            });
        });
    }
};
