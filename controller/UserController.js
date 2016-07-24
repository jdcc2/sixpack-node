var models = require('../models.js')

module.exports = {
    get: function(req, res) {
        models.User.findById(req.params.id, {attributes: { exclude: ['password']}}).then(function(user){
            if(user) {
                res.json(user);
            } else {
                res.json({success: false});
            }
        }).catch(function(err) {
            console.log('error returning user');
            console.log(err);
            res.json({success: false})
        });

    },
    post: function(req, res) {
        models.User.findById(req.params.id, {attributes: { exclude: ['password']}}).then(function(user){
            if(user) {
                //Delete the id property to prevent updating the primary key (which should never be necessary)
                //Sequelize only supports specifying all fields which are allowed to be updated and not the opposite (ugh)
                delete req.body.id;
                return user.update(req.body);
            } else {
                res.json({success: false});
            }
        }).then(function(user) {
            delete user.dataValues.password;
            return res.json(user);
        }).catch(function(err) {
            console.log('error updating user');
            console.log(err);
            res.json({success: false})
        });
    },
    delete: function(req, res) {
        models.User.findById(req.params.id).then(function(user){
            return user.destroy();
        }).then(function() {
            res.json({success: true});
        }).catch(function(err) {
            console.log('error deleting user');
            console.log(err);
            res.json({success: false})
        });
    }
}
