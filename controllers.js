'use strict'

var ResourceController = require('./controller/ResourceController.js')
var UserController = require('./controller/UserController')
var APITokenController = require('./controller/APITokenController')
var models = require('./models.js')

module.exports = {
    ConsumableController: new ResourceController('consumables', models.Consumable),
    UserController: new UserController('users', models.User, {returnExclude: ['localprofile']}),
    ConsumptionController: new ResourceController('consumptions', models.Consumption),
    RoleController: new ResourceController('roles', models.Role),
    UserRoleController: new ResourceController('userroles', models.UserRole, {acl: {get: ['$owner'], all: ['sixpackadmin']}}),
    APITokenController: new APITokenController('apitokens', models.APIToken)
}
