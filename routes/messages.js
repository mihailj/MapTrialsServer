var models  = require('../models');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var authenticate = require('../oauth_authenticate')
var uuid = require('node-uuid');

router.route('/:message_id')

// update a user (accessed at PUT */locations/:location_id)
/*.put(authenticate({scope:'admin'}), function(req, res) {
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
})*/

// get a message by id (accessed at GET */locations/:location_id)
/*.get(authenticate({scope:'admin,user'}), function(req, res) {

  // TODO: check user rights to read message (sender or recipient)

	models.mt_messages.findById(req.params.message_id)
	.then(function(message) {
		console.log(message);
		if (message) {
		  res.json(message);
		} else {
		  res.send(401, "Message not found");
		}
	  }, function(error) {
		res.send("Message not found");
	  });
})*/

// delete a message by id (accessed at DELETE */messages/:message_id)
.delete(authenticate({scope:'admin,user'}), function(req, res) {

  // TODO: check if user_id or recipient_id is req.user.user.id
	// TODO: only admin can delete 'all' messages sent by itself

	models.mt_messages.destroy({
		where: { id: req.params.message_id }
	}).then(function(messages) {
		  res.json({ message: 'Message removed!' });

	  }, function(error) {
			res.send("Message not found");
	  });
});

router.post('/', authenticate({scope:'admin,user'}), function(req, res) {

	// user can only reply not send new messages

	if (req.user.scope == 'user' && !req.body.reply_to) {
		res.send(400, "Invalid scope: scope is invalid");
		return;
	}

	console.log('post new message');
	console.log(req.body);
	console.log('user:');
	console.log(req.user);

	var msg_type = 'single';

	if (req.body.to.length == 0) {
		res.send(401, "Recipient not found");
	}	else if (req.body.to.length == 1) {
		if (req.body.to[0] == '0') {
			msg_type = 'all';
		}
	} else if (req.body.to.length > 1) {
		msg_type = 'multiple';
	}

	console.log('msg type: ' + msg_type);

	var uid = uuid.v4();

	console.log('uid: ' + uid);

	if (msg_type == 'all') {
		var msg_all = {
			type: msg_type,
			user_id: req.user.user.id,
			subject: req.body.subject,
			body: req.body.body,
			uid: uid
		};

		models.mt_messages.create(msg_all).then(function(msg) {
			models.mt_messages.findOne({
	     where: { id: msg.id },
	 		 include: [
	 			{
	 				model: models.mt_users,
	 				attributes: ['username'],
	         as: 'user_sender'
	 			},
	       {
	 				model: models.mt_users,
	 				attributes: ['username'],
	         as: 'user_recipient',
	         required: false
	 			}
	 		],
		}).then(function(msg2){
			res.json(msg2);
		 });
		});

	} else if (msg_type == 'multiple') {

		var obj_arr = [];

		for (var i in req.body.to) {
			if (req.body.to[i] != '0') {
				obj_arr.push({
					type: msg_type,
					user_id: req.user.user.id,
					subject: req.body.subject,
					body: req.body.body,
					recipient_id: req.body.to[i],
					uid: uid
				});
			}
		}

		models.mt_messages.bulkCreate(obj_arr).then(function() { // Notice: There are no arguments here, as of right now you'll have to...
		  //return models.mt_messages.findAll();
			return models.mt_messages.findOne({
	     where: { uid: uid,
			  			  user_id: req.user.user.id },
	 		 include: [
	 			{
	 				model: models.mt_users,
	 				attributes: ['username'],
	         as: 'user_sender'
	 			},
	       {
	 				model: models.mt_users,
	 				attributes: ['username'],
	         as: 'user_recipient',
	         required: false
	 			}
	 		],
		 });

	 }).then(function(msg) {
		  console.log(msg); // ... in order to get the array of user objects
			res.json(msg);
		})

  } else {

		var msg_single = {
			type: msg_type,
			user_id: req.user.user.id,
			subject: req.body.subject,
			body: req.body.body,
			recipient_id: req.body.to[0],
			uid: uid
		};

		if (req.body.reply_to) {
			msg_single.reply_to = req.body.reply_to;
		}

		models.mt_messages.create(msg_single).then(function(msg) {
			models.mt_messages.findOne({
	     where: { id: msg.id },
	 		 include: [
	 			{
	 				model: models.mt_users,
	 				attributes: ['username'],
	         as: 'user_sender'
	 			},
	       {
	 				model: models.mt_users,
	 				attributes: ['username'],
	         as: 'user_recipient',
	         required: false
	 			}
	 		],
		 }).then(function(msg2){
			res.json(msg2);
		 });
		});

	}

});

/* GET messages listing. */
router.get('/', authenticate({scope:'admin,user'}), function(req, res, next) {

	 models.mt_messages.findAll({
    where: {
      $or: [
        { user_id: req.user.user.id },
        { recipient_id: req.user.user.id },
        { type: 'all' }
      ]
    },
		include: [
			{
				model: models.mt_users,
				attributes: ['username'],
        as: 'user_sender'
			},
      {
				model: models.mt_users,
				attributes: ['username'],
        as: 'user_recipient',
        required: false
			}
		],
    order: [
      ['sent_date', 'DESC'],
    ]
  }).then(function(messages) {
		res.json(messages);
	});
});


module.exports = router;
