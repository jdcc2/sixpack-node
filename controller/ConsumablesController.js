var models = require('../models.js')
var MultiResourceController = require('./MultiResourceController.js')

module.exports = new MultiResourceController('consumable', models.Consumable, ['descption'], ['desction']);


// module.exports = {
//     get: function(req, res) {
//         models.Consumable.findAll().then(function(consumables) {
//             console.log('returned all consumables');
//             res.json(consumables);
//         }).catch(function(err) {
//             console.log('error returning consumables');
//             console.log(err);
//             res.json({success: false})
//         })
//     },
//     post: function(req, res) {
//         models.Consumable.create(req.body).then(function(consumable) {
//             console.log("created consumable");
//             console.log(consumable);
//             res.json({success : true});
//         }).catch(function(err) {
//             console.log('error creating consumable');
//             console.log(err);
//             res.json({success: false});
//         });
//     }
// }
