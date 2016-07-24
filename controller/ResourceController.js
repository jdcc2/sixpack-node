'use strict'

var Response = require('../response.js')
var errors = require('../errors.js')
var _ = require('underscore')

//TODO merge ResourceController and MultiResourceController
/*
Params:
    returnExclude: array containing all fields that will not be returned in all request
    updateExclude: all fields that are not allowed to be updated (ID fields are not allowed to be updated by Sequelize)
    route: api route will become: /<route>/:id
    model: Sequelize model instance used to fetch data
*/
function ResourceController(route, model, returnExclude, updateExclude) {

    //TODO maybe check argument types, regard it as a breach of contract for now
    this.route = route;
    this.model = model;
    this.returnExclude = returnExclude;
    this.updateExclude = updateExclude;
}

//Handles deletion of properties of single Instance objects based on the returnExclude list
ResourceController.prototype.prepReturn = function(resource) {
    if(_.isArray(this.returnExclude)) {
        console.log('deleting parameters before return');
        _.each(this.returnExclude, function(propName) {
            delete resource['dataValues'][propName]
        });
    }
}

//Handles deletion of properties of single objects based on the updateExclude list
ResourceController.prototype.prepUpdate = function(resource) {
    if(_.isArray(this.updateExclude)) {
        console.log('deleting parameters before update');
        _.each(this.updateExclude, function(propName) {
            delete resource[propName]
        });
    }
}


ResourceController.prototype.get = function(req, res, next) {
    var prepReturn = this.prepReturn.bind(this);
    this.model.findById(req.params.id).then(function(resource){
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
    this.prepUpdate(req.body);
    this.model.findById(req.params.id).then(function(resource){
        if(resource) {
            //Delete the id property to prevent updating the primary key (which should never be necessary)
            //Sequelize only supports specifying all fields which are allowed to be updated and not the opposite (ugh)
            //delete req.body.id;
            console.log('updating resource');
            return resource.update(req.body);
        } else {
            next(new errors.ResourceNotFoundError());
        }

    }).then(function(resource) {
        prepReturn(resource);
        res.json(new Response(resource));
    }).catch(function(err) {
        next(err);
    });
}

ResourceController.prototype.delete = function(req, res, next) {
    this.model.findById(req.params.id).then(function(resource){
        return resource.destroy();
    }).then(function(){
        res.json(new Response());
    }).catch(function(err) {
        next(err);
    });
}


module.exports = ResourceController;
