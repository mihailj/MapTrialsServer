var models  = require('../models');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var authenticate = require('../oauth_authenticate')
var fecha = require('fecha');

router.route('/:session_id')

// update a session (accessed at PUT */tracking_sessions/:session_id)
.put(authenticate({scope:'admin'}), function(req, res) {

	models.mt_tracking_sessions.update({
    admin_id_end: req.user.user.id,
    date_end: fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
  },
  {
    where: {
      id: req.params.session_id
    }
  })
	.then (function(success) {
		console.log(success);
		if (success) {

			models.mt_tracking_sessions.findOne({
				where: { id: req.params.session_id },
				include: [
					{
						model: models.mt_tracking,
						required: false
					}
				]
			})
			.then(function(tracking_session) {
				console.log(tracking_session);
				if (tracking_session) {
				  res.json(tracking_session);
				} else {
				  res.send(401, "Tracking session not found");
				}
			  }, function(error) {
				res.send("Tracking session not found");
			  });

			//res.json({ message: 'Tracking session updated!' });
		} else {
		  res.send(401, "Tracking session not found");
		}
	}, function(error) {
		res.send("Tracking session not found");
	});
})

// get a session with tracking data by id (accessed at GET */tracking_sessions/:session_id)
.get(authenticate({scope:'admin,user'}), function(req, res) {
	models.mt_tracking_sessions.findOne({
		where: { id: req.params.session_id },
		include: [
			{
				model: models.mt_tracking,
				required: false
			}
		]
	})
	.then(function(tracking_session) {
		console.log(tracking_session);
		if (tracking_session) {
		  res.json(tracking_session);
		} else {
		  res.send(401, "Tracking session not found");
		}
	  }, function(error) {
		res.send("Tracking session not found");
	  });
})

// delete a session by id (accessed at DELETE */tracking_sessions/:session_id)
.delete(authenticate({scope:'admin'}), function(req, res) {
	//var loc =  models.mt_locations;

	models.mt_tracking_sessions.destroy({
		where: { id: req.params.session_id }
	}).then(function(tracking_sessions) {
		if (tracking_sessions) {
			models.mt_tracking.destroy({
				where: { session_id: req.params.session_id }
			}).then(function(compl) {
				res.json({ message: 'Tracking session removed!' });
			});
		  // delete associated objectives
		  /*models.mt_objectives.findAll({
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
		  });*/

		} else {
		  res.send(401, "Tracking session not found");
		}
	  }, function(error) {
			res.send("Tracking session not found");
	  });
});

router.post('/', authenticate({scope:'admin'}), function(req, res) {

  models.mt_tracking_sessions.update({
    admin_id_end: req.user.user.id,
    date_end: fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
  },
  {
    where: {
      user_id: req.body.user_id,
      date_end: null
    }
  })
	.then (function(success) {
		console.log(success);

      models.mt_tracking_sessions.create({
    	   admin_id_start: req.user.user.id,
         date_start: fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss'),
         user_id: req.body.user_id
      }).then(function(sess) {
        res.json(sess);
      });

	}, function(error) {
		res.send("Tracking session not found");
	});


});

/* GET tracking sessions listing. */
/*
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
});*/


module.exports = router;
