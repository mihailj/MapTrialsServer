var models  = require('../models');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var authenticate = require('../oauth_authenticate')


router.route('/:objective_id')

// update a user (accessed at PUT */objectives/:objective_id)
.put(authenticate({scope:'admin'}), function(req, res) {
	var objective = models.mt_objectives;	
	  
	objective.update({ title: req.body.title, latitude: req.body.latitude, longitude: req.body.longitude }, { where: { id: req.params.objective_id } })
	.then (function(success) {
		console.log(success);
		if (success) {	
			res.json({ message: 'Objective updated!' });
		} else {
		  res.send(401, "Objective not found");
		}
	  }, function(error) {
		res.send("Objective not found");
	  });
})

// get an objective by id(accessed at GET */objectives/:objective_id)
.get(authenticate({scope:'admin,user'}), function(req, res) {
	
	models.mt_objectives.findOne({
		where: { id: req.params.objective_id },
		include: [ 
			{ 
				model: models.mt_completion, 
				required: false, 
				include: [ 
					{ 
						model: models.mt_users, 
						required: false, 
						attributes: { exclude: ['password'] } 
					} 
				] 
			}, 
			{ 
				model: models.mt_users, 
				attributes: ['username'] 
			}
		]
	}).then(function(locations) {
		console.log(locations);
		if (locations) {				
		  res.json(locations);
		} else {
		  res.send(401, "Objective not found");
		}
	  }, function(error) {
		res.send("Objective not found");
	  });
})

// delete an objective by id (accessed at DELETE */objectives/:objective_id)
.delete(authenticate({scope:'admin'}), function(req, res) {
	
	// delete objective completions
	models.mt_completion.destroy({
		where: {
			objective_id: req.params.objective_id
		}
	}).then(function(completion) {

		var objective =  models.mt_objectives;

		objective.destroy({
			where: {
				id: req.params.objective_id
			}
		})
		.then(function(objectives) {
			if (objectives) {				
			  res.json({ message: 'Objective removed!' });
			} else {
			  res.send(401, "Objective not found");
			}
		  }, function(error) {
			res.send("Objective not found");
		  });
	});
});	

router.post('/', authenticate({scope:'admin'}), function(req, res) {
        
  models.mt_objectives.create({
	user_id: req.user.user.id,
	location_id: req.body.location_id,
    title: req.body.title,
	multiple: req.body.multiple,
	score: req.body.score
  }).then(function(objective) {

	// return objective with associated user
	models.mt_objectives.findOne({
		where: { id: objective.id },
		include: [ { model: models.mt_completion, required: false }, { model: models.mt_users, attributes: ['username'] } ]
	}).then(function(objective) {
		//console.log(locations);
		if (objective) {				
		  res.json(objective);
		} else {
		  res.send(401, "Objective not found");
		}
	  }, function(error) {
		res.send("Objective not found");
	  });	
  });

});

/* GET objectives listing. */
router.get('/', authenticate({scope:'admin,user'}), function(req, res, next) {
	 models.mt_objectives.findAll({

	  }).then(function(objectives) {
		res.json(objectives);
	  });  
});

	
module.exports = router;
