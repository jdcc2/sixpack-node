'use strict'

var MultiResourceController = require('./controller/MultiResourceController.js')
var ResourceController = require('./controller/ResourceController.js')
var models = require('./models.js')

module.exports = {
    ConsumablesController: new MultiResourceController('consumables', models.Consumable, null, null),
    ConsumableController: new ResourceController('consumables', models.Consumable, null, null),
    UserController: new ResourceController('users', models.User, ['password']),
    UsersController: new MultiResourceController('users', models.User, ['password']),
    ConsumptionController: new ResourceController('consumptions', models.Consumption),
    ConsumptionsController: new MultiResourceController('consumptions', models.Consumption)
}
