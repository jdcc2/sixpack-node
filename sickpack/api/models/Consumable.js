/**
 * Consumable.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

module.exports = {

  attributes: {
      id: {
          type: 'string',
          size: 44,
          minLength: 6,
          alpha: true,
          primaryKey: true
      },
      description: {
          type: 'string',
          defaultsTo: ''
      },
      estimatedPrice: {
          type: 'number',
          float: true,
          required: true,
          notNull: true
      },
      consumptions: {
          collection: 'consumption',
          via: 'consumable'
      }
  }
};
