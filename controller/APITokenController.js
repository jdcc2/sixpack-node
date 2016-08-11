'use strict'

var Response = require('../response.js')
var errors = require('../errors.js')
var models = require('../models.js')
var _ = require('underscore')

function APITokenController(route, model, options) {

    //TODO maybe check argument types, regard it as a breach of contract for now
    this.route = route;
    this.model = model;
    this.options = _.assign({}, {acl : {all: ['$owner', 'sixpackadmin']}}, options);
}

APITokenController.prototype.getAll = function(req, res, next) {
    var prepReturn = this.prepReturn.bind(this);
    var model = this.model;
    this.authorize('get', req.user, null).then(function() {
        return model.findAll({ include: [{ all: true, nested: true }]});
    }).then(function(resources){
        console.log('getting consumables');
        prepReturn(resources);
        res.json(new Response(resources));
    }).catch(function(err) {
        next(err);
    });
}

APITokenController.prototype.delete = function(req, res, next) {
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

APITokenController.prototype.get = function(req, res, next) {
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

APITokenController.prototype.create = function(req, res, next) {
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

module.exports = APITokenController;
