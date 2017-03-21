var models  = require('../models');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var authenticate = require('../oauth_authenticate')
var sequelize = require('sequelize');

router.post('/', authenticate({scope:'admin'}), function(req, res) {

  console.log(req.body);

  function updateSetting(key, value){
    models.mt_settings.update({
      value: value
    }, {
      where: { key: key }
    }).then(function(setting_update) {
          //res.json({ message: 'Settings updated!' });
    });

  }

  var promises = [];

  for (var i in req.body) {
    promises.push(updateSetting(i, req.body[i]));
  }

  sequelize.Promise.all(promises).then(function(promise_all) {
    console.log(promise_all);
    res.json({ message: 1 });
  });

					// update settings
	/*				models.mt_completion.update({
						score: objective.score,
						distance: distance
					}, {
						where: { id: completion.id }
					}).then(function(completion_upd) {
				        res.json({ message: 'Settings updated!' });
					});*/
});

/* GET settings listing. */

router.get('/', authenticate({scope:'admin,user'}), function(req, res, next) {
	 models.mt_settings.findAll({
		//include: [ models.Task ]
  }).then(function(settings) {
		/*res.render('users', {
		  title: 'Sequelize: Express Example',
		  users: users
		});*/
		res.json(settings);
	  });
});

module.exports = router;
