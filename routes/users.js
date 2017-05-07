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

	console.log(req.query);
	
	if (req.query.tracking_sessions) {
		var query_params = { model: models.mt_tracking_sessions, required: false, order: 'date_start DESC' };
	} else {
		var query_params = { model: models.mt_tracking_sessions, required: false, order: 'date_start DESC', limit: 1 };
	}

	models.mt_users.findOne({
		where: { id: req.params.user_id },
		include: [
			{ model: models.mt_completion, required: false },
			query_params
		],
		attributes: { exclude: ['password'] } })
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

router.post('/setdevice_id', authenticate({scope:'admin,user'}), function(req, res) {
	if  (req.user.user.id != req.body.id) {
		res.send("User not available");
	}
	else {
		models.mt_users.update({ device_id: req.body.device_id }, { where: { id: req.body.id } })
		.then (function(success) {
			console.log('setdevice_id success: ');
			console.log(success);
			if (success) {
				console.log('success evaluated true');
				res.json({ success: true, message: 'User updated!' });
			} else {
				console.log('success evaluated false');
				res.send(401, "User not found");
			}
		}, function(error) {
			console.log('setdevice_id error:');
			console.log(error);
			res.send("User not found");
		});
	}
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
			 },
			 /* load last tracking session */
			 {
				 model: models.mt_tracking_sessions,
				 required: false,
				 order: 'date_start DESC',
				 limit: 1
			 }
		 ]
	}).then(function(users) {
		res.json(users);
	});
});


module.exports = router;
