var models = require('../models.js')

module.exports = {
    get: function(req, res) {
        //Exclude the password attribute (for obvious reasons)
        models.User.findAll({attributes: { exclude: ['password']}}).then(function(users) {
            console.log('returned all users');
            res.json(users);
        }).catch(function(err) {
            console.log('error returning users');
            console.log(err);
            res.json({success: false})
        })
    },
    post: function(req, res) {
        models.User.create(req.body).then(function(user) {
            console.log("created user");
            console.log(user);
            res.json({success : true});
        }).catch(function(err) {
            console.log('error creating user');
            console.log(err);
            res.json({success: false});
        });
    }
}
