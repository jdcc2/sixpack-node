var models = require('../models.js')

module.exports = {
    get: function(req, res) {
        models.Consumable.findById(req.params.id).then(function(consumable){
            if(consumable) {
                res.json(consumable);
            } else {
                res.json({success: false});
            }

        }).catch(function(err) {
            console.log('error returning consumable');
            console.log(err);
            res.json({success: false})
        });

    },
    post: function(req, res) {
        models.Consumable.findById(req.params.id).then(function(consumable){
            if(consumable) {
                //Delete the id property to prevent updating the primary key (which should never be necessary)
                //Sequelize only supports specifying all fields which are allowed to be updated and not the opposite (ugh)
                delete req.body.id;
                return consumable.update(req.body);
            } else {
                res.json({"success" : false})
            }

        }).then(function(consumable) {

            return res.json(consumable);
        }).catch(function(err) {
            console.log('error updating consumable');
            console.log(err);
            res.json({success: false})
        });
    },
    delete: function(req, res) {
        models.Consumable.findById(req.params.id).then(function(consumable){
            return consumable.destroy();
        }).then(function(){
            res.json({success: true});
        }).catch(function(err) {
            console.log('error deleting consumable');
            console.log(err);
            res.json({success: false})
        });
    }
}
