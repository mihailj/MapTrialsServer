var models  = require('../models');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var authenticate = require('../oauth_authenticate')


router.route('/:location_id')

// update a user (accessed at PUT */locations/:location_id)
.put(authenticate({scope:'admin'}), function(req, res) {
	var loc = models.mt_locations;

	loc.update({ name: req.body.name, latitude: req.body.latitude, longitude: req.body.longitude }, { where: { id: req.params.location_id } })
	.then (function(success) {
		console.log(success);
		if (success) {
			res.json({ message: 'Location updated!' });
		} else {
		  res.send(401, "Location not found");
		}
	  }, function(error) {
		res.send("Location not found");
	  });
})

// get a location by id (accessed at GET */locations/:location_id)
.get(authenticate({scope:'admin,user'}), function(req, res) {
	//var user =  models.mt_locations;

	models.mt_locations.findById(req.params.location_id)
	.then(function(locations) {
		console.log(locations);
		if (locations) {
		  res.json(locations);
		} else {
		  res.send(401, "Location not found");
		}
	  }, function(error) {
		res.send("Location not found");
	  });
})

// delete a location by id (accessed at DELETE */locations/:location_id)
.delete(authenticate({scope:'admin'}), function(req, res) {
	var loc =  models.mt_locations;

	loc.destroy({
		where: { id: req.params.location_id }
	}).then(function(locations) {
		if (locations) {

		  // delete associated objectives
		  models.mt_objectives.findAll({
			where: { location_id: req.params.location_id }
		  }).then(function(objectives) {
			  for (var i in objectives) {
				models.mt_completion.destroy({
					where: { objective_id: objectives[i].id }
				}).then(function(compl) {

				});

				models.mt_objectives.destroy({
					where: { id: objectives[i].id }
				}).then(function(obj) {

				});
			  }
		  });

		  res.json({ message: 'Location removed!' });
		} else {
		  res.send(401, "Location not found");
		}
	  }, function(error) {
		res.send("Location not found");
	  });
});

router.post('/', authenticate({scope:'admin'}), function(req, res) {

  models.mt_locations.create({
	user_id: req.user.user.id,
    name: req.body.name,
	latitude: req.body.latitude,
	longitude: req.body.longitude
  }).then(function(loc) {
		// get location with username
		models.mt_locations.findOne({
			where: { id: loc.id },
			include: [
				{
					model: models.mt_users,
					attributes: ['username']
				}
			]
		}).then(function(location) {
			res.json(location);
		});
  });

});

/* GET locations listing. */
router.get('/', authenticate({scope:'admin,user'}), function(req, res, next) {
	 models.mt_locations.findAll({
		include: [
			{
				model: models.mt_objectives,
				include: [
					{
						model: models.mt_completion,
						required:false
					},
					{
						model: models.mt_users,
						attributes: ['username']
					}
				]
			},
			{
				model: models.mt_users,
				attributes: ['username']
			}
		]
	  }).then(function(locations) {
		res.json(locations);
	  });
});


module.exports = router;
