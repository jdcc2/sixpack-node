'use strict'

var Response = require('../response.js')
var errors = require('../errors.js')
var _ = require('underscore')

/*
Params:

    route: api route will become: /<route>/:id
    model: Sequelize model instance used to fetch data
    options: {<optionkey> : <argument>}
    //options list
    - returnExclude: array containing all fields that will not be returned in all request
    - updateExclude: all fields that are not allowed to be updated (ID fields are not allowed to be updated by Sequelize)
    - acl: { <operation> : [<role>] } if "all" is specified as the operation the role(s) apply to all API functions. The default ACL is {all: ['$owner', 'sixpackadmin']}
*/
function ResourceController(route, model, options) {

    //TODO maybe check argument types, regard it as a breach of contract for now
    this.route = route;
    this.model = model;
    this.options = _.assign({}, {acl : {all: ['$owner', 'sixpackadmin']}}, options);
}

//Handles deletion of properties of Arrays of Sequelize Instance objects and single Instance objects based on the returnExclude list
ResourceController.prototype.prepReturn = function(resources) {
    if(_.isArray(this.options.returnExclude)) {
        console.log('deleting parameters before return');
        _.each(this.options.returnExclude, function(propName) {
            if(_.isArray(resources)) {
                _.each(resources, function(item, index) {
                    delete resources[index]['dataValues'][propName];
                });
            } else {
                console.log(typeof resources);
                delete resources['dataValues'][propName];
            }

        });
    }
}

//Handles deletion of properties of Arrays of Objects and single Objects based on the updateExclude list
ResourceController.prototype.prepUpdate = function(resources) {
    if(_.isArray(this.options.updateExclude)) {
        console.log('deleting parameters before update');
        _.each(this.options.updateExclude, function(propName) {
            if(_.isArray(resources)) {
                _.each(resources, function(item, index) {
                    delete resources[index][propName];
                });
            } else {
                delete resources[propName];
            }

        });
    }
}

ResourceController.prototype.getAll = function(req, res, next) {
    var prepReturn = this.prepReturn.bind(this);
    var model = this.model;
    this.authorize('get', req.user, null).then(function() {
        return model.findAll({ include: [{ all: true, nested: true }]});
    }).then(function(resources){
        console.log('getting consumables');
        console.log(this);
        prepReturn(resources);
        res.json(new Response(resources));
    }).catch(function(err) {
        next(err);
    });
}

ResourceController.prototype.create = function(req, res, next) {
    var prepReturn = this.prepReturn.bind(this);
    var model = this.model;
    //Check the fields parameter of create() for an alternative method to filter user specified fields
    this.prepUpdate(req.body);
    this.authorize('post', req.user, null).then(function() {
        return model.create(req.body);
    }).then(function(resource) {
        console.log("created resource");
        prepReturn(resource);
        res.json(new Response(resource));
    }).catch(function(err) {
        console.log('error creating resource');
        console.log(err);
        next(err);
    });
}


ResourceController.prototype.get = function(req, res, next) {
    var model = this.model;
    var prepReturn = this.prepReturn.bind(this);
    this.authorize('get', req.user, req.params.id).then(function() {
        return model.findById(req.params.id, { include: [{ all: true, nested: true }]});
    }).then(function(resource){
        if(resource) {
            prepReturn(resource);
            res.json(new Response(resource));
        } else {
            next(new errors.ResourceNotFoundError());
        }

    }).catch(function(err) {
        next(err);
    });

}

ResourceController.prototype.post = function(req, res, next) {
    var prepReturn = this.prepReturn.bind(this);
    var model = this.model;
    this.prepUpdate(req.body);

    this.authorize('post', req.user, req.params.id).then(function() {
        return model.findById(req.params.id);
    }).then(function(resource){
        if(resource) {
            //Delete the id property to prevent updating the primary key (which should never be necessary)
            //Sequelize only supports specifying all fields which are allowed to be updated and not the opposite (ugh)
            //delete req.body.id;
            console.log('updating resource');
            return resource.update(req.body);
        } else {
            throw new errors.ResourceNotFoundError();
        }

    }).then(function(resource) {
        prepReturn(resource);
        res.json(new Response(resource));
    }).catch(function(err) {
        next(err);
    });
}

ResourceController.prototype.delete = function(req, res, next) {
    var model = model;
    this.authorize('delete', req.user, req.params.id).then(function() {
        return model.findById(req.params.id);
    }).then(function(resource){
        return resource.destroy();
    }).then(function(){
        res.json(new Response());
    }).catch(function(err) {
        next(err);
    });
}

ResourceController.prototype.authorizeRead = function(req, res, next){
    console.log('authorizeRead');
    var hasRole = false;
    //Loop over the user roles and check if it matches on of allowed roles
    _.each(req.user.userroles, function(userrole) {
        console.log(`allowed roles: ${this.readRoles}`);
        if(_.contains(this.readRoles, userrole.roleId)) {
            console.log('role found');
            hasRole = true;
        }
    }, this);

    var isOwner = false;
    //If the user has no role granting access, check if the user has the impicit owner role
    //NOTE this does not work for the User resource itself since the User model has no userId field
    if(_.contains(this.readRoles, '$owner') && req.params.id && !hasRole) {
        console.log('checking if owner');
        console.log(`current user id: ${req.user.id}`);
        this.model.count({where: ['userId = ? AND id = ?', req.user.id, req.params.id]}).then(function(c) {
            console.log(`count: ${c}`)
            if(c === 1) {
                console.log('isOwner');
                isOwner = true;
            }
            //Execute the route handler or return an error based on the results
            //Return an error if not authorized
            console.log(`hasRole?: ${hasRole}`);
            console.log(`isOwner?: ${isOwner}`);
            if(!(hasRole || isOwner)) {
                next(new errors.AuthorizationError());
            } else {
                next();
            }

        }).catch(function(err) {
            next(err);
        });


    } else {
        console.log(`hasRole?: ${hasRole}`);
        console.log(`isOwner?: ${isOwner}`);
        if(!(hasRole || isOwner)) {
            next(new errors.AuthorizationError());
        } else {
            next();
        }
    }

}

//resourceId can be null (in the case of getAll() e.g.)
//the return value is a promise which will reject with an AuthorizationError if authorization fails
ResourceController.prototype.authorize = function(httpMethod, user, resourceId){
    console.log('authorize');
    var model = this.model;
    var hasRole = false;
    var isOwner = false;
    //Check if there the user has the required role for the current httpMethod or for the catchall specifier
    if(this.options.acl && _.isArray(this.options.acl[httpMethod])) {
        //Loop over the user roles and check if it matches on of allowed roles
        _.each(user.userroles, function(userrole) {
            console.log(`allowed roles for current method: ${this.options.acl[httpMethod]}`);
            if(_.contains(this.options.acl[httpMethod], userrole.roleId)) {
                console.log('role found');
                hasRole = true;
            }
        }, this);

    } else if(this.options.acl && _.isArray(this.options.acl['all'])) {
        //Loop over the user roles and check if it matches on of allowed roles
        _.each(user.userroles, function(userrole) {
            console.log(`allowed roles for all methods: ${this.options.acl['all']}`);
            if(_.contains(this.options.acl['all'], userrole.roleId)) {
                console.log('role found');
                hasRole = true;
            }
        }, this);
    }

    //Checking ownership
    //Checking for ownership if specified in ACL (and needed/possible)
    if(this.options.acl && ((_.isArray(this.options.acl['all']) && _.contains(this.options.acl['all'], '$owner')) || (_.isArray(this.options.acl[httpMethod]) && _.contains(this.options.acl[httpMethod], '$owner'))) && resourceId && !hasRole) {
        return new Promise(function(resolve, reject) {
            console.log('checking if owner');
            console.log(`current user id: ${user.id}`);
            model.count({where: ['userId = ? AND id = ?', user.id, resourceId]}).then(function(c) {
                console.log(`count: ${c}`)
                if(c === 1) {
                    console.log('isOwner');
                    isOwner = true;
                }

                //Return false if not authorized
                console.log(`hasRole?: ${hasRole}`);
                console.log(`isOwner?: ${isOwner}`);
                console.log(`result: ${isOwner || hasRole}`);
                if(hasRole || isOwner) {
                    resolve();
                } else {
                    reject(new AuthorizationError());
                }
            }).catch(function(err) {
                reject(new AuthorizationError("An error occured during the authorization process."));
            });
        });

    } else {
        //Return false if not authorized
        console.log(`hasRole?: ${hasRole}`);
        console.log(`isOwner?: ${isOwner}`);
        return (hasRole || isOwner) ? Promise.resolve(): Promise.reject();
    }

}


module.exports = ResourceController;
