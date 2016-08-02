'use strict'

var ResourceController = require('./controller/ResourceController.js')
var models = require('./models.js')

module.exports = {
    ConsumableController: new ResourceController('consumables', models.Consumable),
    UserController: new ResourceController('users', models.User, ['password']),
    ConsumptionController: new ResourceController('consumptions', models.Consumption),
    RoleController: new ResourceController('roles', models.Role),
    UserRoleController: new ResourceController('userroles', models.UserRole)
}
