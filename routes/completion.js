var models  = require('../models');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var authenticate = require('../oauth_authenticate')


router.route('/:completion_id')

// delete an objective completion by id (accessed at DELETE */completion/:completion_id)
.delete(authenticate({scope:'admin'}), function(req, res) {
	var completion =  models.mt_completion;
	
	var objective_id;
	
	// get objective id
	
	completion.findById(req.params.completion_id)
	.then(function(completion) {
		//console.log('completion delete findById ' + req.params.completion_id + ':');
		//console.log(completion);
		//console.log('----------');		
		if (completion) {				
		  objective_id = completion.objective_id;
		  
		  // update user points and objectives completed number
		  models.mt_users.findById(completion.user_id).then(function(user) {
			  
				models.mt_users.update({ 
					score: user.score - completion.score, 
					objectives_completed: user.objectives_completed - 1
				}, { 
					where: { id: user.id } 
				}).then(function() {
					completion.destroy({
						where: {
							id: req.params.completion_id
						}
					})
					.then(function(completions) {
						if (completions) {			
						  //console.log('completion delete destroy:');
						  //console.log(completions);
						  //console.log('----------');
						  
						  // update objective completed field
						  
						  models.mt_objectives.update({ completed: 'n' }, { where: { id: objective_id } })
						  .then(function(success) {

							  res.json({ message: 'Objective completion removed!' });						  
							  //console.log('completion delete objective ' + objective_id + ' update:');
							  //console.log(success);
							  //console.log('----------');
						  }, function(error) {
						  });

						} else {
						  res.send(401, "Objective completion not found");
						}
					  }, function(error) {
						res.send("Objective completion not found");
					  });
				  
				});
			  
		  });
		  
		  				  
		} else {
		  res.send(401, "Objective completion not found");
		}
	}, function(error) {
		res.send("Objective completion not found");
	});	
	
});	


router.post('/', authenticate({scope:'admin,user'}), function(req, res) {

    // check if already completed by this user to prevent double score

	models.mt_completion.findOne({
		where: {
			objective_id: req.body.objective_id,
			user_id: req.user.user.id
		}
	}).then(function(objective) {
	
		//console.log(objective);
		
		if (!objective) {
		
			console.log('[completion] - is not duplicate');
		
		  models.mt_completion.create({
			user_id: req.user.user.id,
			objective_id: req.body.objective_id,
			user_comment: req.body.comment,
			objective_photo: req.body.objective_photo,
			latitude: req.body.latitude,
			longitude: req.body.longitude
		  }).then(function(completion) {
			
			console.log('[completion] - created');
			console.log(completion.toJSON());
			
			console.log('[completion] - find objective');
			
			// update objective
			models.mt_objectives.findOne({ 
				where: { id: req.body.objective_id },
				include: [ 
					{ 
						model: models.mt_locations, 
						attributes: ["latitude", "longitude"]
					} 
				]
			}).then(function(objective) {
				
				if (objective) {				
				
					console.log('[completion] - objective found');
					console.log(objective.toJSON());
				
					console.log('[completion] - updating distance and score in completion table');
					
					// update distance and score in completion table
					models.mt_completion.update({
						score: objective.score,
						distance: calcCrow(req.body.latitude, req.body.longitude, objective.mt_location.latitude, objective.mt_location.longitude)
					}, {
						where: { id: completion.id }
					}).then(function(completion_upd) {
						console.log('[completion] - distance and score updated');
						//console.log(completion_upd);
						
									

						console.log('[completion] - finding user');
											
						// update user score
						models.mt_users.findById(req.user.user.id)
						.then(function(user) {
							
							console.log('[completion] - user found');
							console.log(user.toJSON());

							console.log('[completion] - updating user score and objectives completed');						
							
							models.mt_users.update({
								score: user.score + objective.score,
								objectives_completed: user.objectives_completed + 1
							}, { 
								where: { id: user.id }
							}).then(function(user_upd) {	
								console.log('[completion] - user score and objectives number updated');
								//console.log(user_upd);
								
					
								if (objective.multiple == 'n') {
									
									console.log('[completion] - objective multiple completions is false, updating completed field');
									
									models.mt_objectives.update({
										completed: 'y'
									}, { 
										where: { id: objective.id }
									}).then(function() {	
										console.log('[completion] - completed field set to "y"');
										
										
									  console.log('[completion] - send completed json to client');
									  console.log(completion.toJSON());
									  
									  res.json(completion);
									});
								} else {

								  console.log('[completion] - send completed json to client');
								  console.log(completion.toJSON());								
								  
								  res.json(completion);
								}
															
							});				
						});						
					});


				}
			  }, function(error) {
				 console.log('[completion] - OBJECTIVE ERROR:');
				 console.log(error);
				res.send("Objective not found");
			  });

			  //res.json({ message: 'Objective completed!' });
		  });
		}
	});
});

/* GET users listing. */

/*
router.get('/', authenticate({scope:'admin,user'}), function(req, res, next) {
	 models.mt_objectives.findAll({
		//include: [ models.Task ]
	  }).then(function(objectives) {
		/*res.render('users', {
		  title: 'Sequelize: Express Example',
		  users: users
		});*/ /*
		res.json(objectives);
	  });  
});
*/

module.exports = router;

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
	return Value * Math.PI / 180;
}