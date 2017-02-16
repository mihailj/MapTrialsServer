var models  = require('../models');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var authenticate = require('../oauth_authenticate')
var sequelize = require('sequelize');
var bcrypt = require("bcryptjs");

router.route('/:user_id')

// update an user (accessed at PUT */users/:user_id)
.put(authenticate({scope:'admin'}), function(req, res) {
	var user = models.mt_users;

	user.update({ username: req.body.username, password: bcrypt.hashSync(req.body.password, 10) }, { where: { id: req.params.user_id } })
	.then (function(success) {
		console.log(success);
		if (success) {
			res.json({ message: 'User updated!' });
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not found");
	  });
})

// get an user by id(accessed at GET */users/:user_id)
.get(authenticate({scope:'admin,user'}), function(req, res) {

	if (req.user.scope != 'admin') {
		if  (req.user.user.id != req.params.user_id) {
			res.send("User not available");
		}
	}

	models.mt_users.findOne({ where: { id: req.params.user_id }, include: [ { model: models.mt_completion, required: false } ], attributes: { exclude: ['password'] } })
	.then(function(users) {
		console.log(users);
		if (users) {
		  res.json(users);
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not found");
	  });
})

// delete an user by id (accessed at DELETE */users/:user_id)
.delete(authenticate({scope:'admin'}), function(req, res) {
	var user =  models.mt_users;

	user.destroy({
    where: {
        id: req.params.user_id
    }
	})
	.then(function(users) {
		if (users) {
		  res.json({ message: 'User removed!' });
		} else {
		  res.send(401, "User not found");
		}
	  }, function(error) {
		res.send("User not found");
	  });
});

router.post('/', authenticate({scope:'admin'}), function(req, res) {

	models.mt_users.findOne({
	  where: sequelize.where(sequelize.fn('lower', sequelize.col('username')), req.body.username.toLowerCase())
	}).then(function(user) {
	  if (user) {

		// return HTTP status 422 = Unprocessable Entity
		res.status(422).end();

	  } else {
		if (req.body.type == 'admin') {
		  scope = 'admin';
		} else {
		  scope = 'user';
		}

		models.mt_users.create({
			username: req.body.username,
			password: bcrypt.hashSync(req.body.password, 10),
			type: req.body.type,
			score: 0,
			scope: scope
		}).then(function(user) {
			res.json(user);
		});
	  }
	});
});

/* GET users listing. */
router.get('/', authenticate({scope:'admin'}), function(req, res, next) {
	models.mt_users.findAll({
		 attributes: { exclude: ['password'] },
		 include: [
			 {
				 model: models.mt_completion,
				 include: [
					 {
						 model: models.mt_objectives,
						 include: [
							 {
								 model: models.mt_locations
							 }
						 ]
					 }
				 ]
			 }
		 ]
	}).then(function(users) {
		res.json(users);
	});
});


module.exports = router;
