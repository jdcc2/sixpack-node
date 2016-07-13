/**
 * Role.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      id: {
          type: 'string',
          size: 50,
          minLength: 6,
          primaryKey: true,
          alpha: true
      },
      users: {
          collection: 'user',
          via: 'roles'
      }
  }
};
