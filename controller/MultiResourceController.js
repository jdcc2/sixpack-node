var Response = require('../response.js')
var errors = require('../errors.js')
var _ = require('underscore')


function MultiResourceController(route, model, returnExclude, updateExclude) {
    //Route form will become: /<route>/:id
    this.route = route;
    this.model = model;
    this.returnExclude = returnExclude;
    this.updateExclude = updateExclude;
}

//TODO convert this to ES6 syntax and use extend syntax for one Resource base class (when no longer supporting/using old Node versions)
//Handles deletion of properties of Arrays of Sequelize Instance objects and single Instance objects based on the returnExclude list
MultiResourceController.prototype.prepReturn = function(resources) {
    if(_.isArray(this.returnExclude)) {
        console.log('deleting parameters before return');
        _.each(this.returnExclude, function(propName) {
            if(_.isArray(resources)) {
                _.each(resources, function(item, index) {
                    delete resources[index]['dataValues'][propName];
                });
            } else {
                delete resources['dataValues'][propName];
            }

        });
    }
}

//Handles deletion of properties of Arrays of Objects and single Objects based on the updateExclude list
MultiResourceController.prototype.prepUpdate = function(resources) {
    if(_.isArray(this.updateExclude)) {
        console.log('deleting parameters before update');
        _.each(this.updateExclude, function(propName) {
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

MultiResourceController.prototype.get = function(req, res, next) {
    var prepReturn = this.prepReturn.bind(this);
    this.model.findAll().then(function(resources){
        console.log('getting consumables');
        console.log(this);
        prepReturn(resources);
        res.json(new Response(resources));
    }).catch(function(err) {
        next(err);
    });

}

MultiResourceController.prototype.post = function(req, res, next) {
    var prepReturn = this.prepReturn.bind(this);
    this.prepUpdate(req.body);
    this.model.create(req.body).then(function(resource) {
        console.log("created resource");
        prepReturn(resource);
        res.json(new Response(resource));
    }).catch(function(err) {
        console.log('error creating resource');
        console.log(err);
        next(err);
    });
}


module.exports = MultiResourceController;
