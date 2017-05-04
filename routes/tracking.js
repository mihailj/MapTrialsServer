var models  = require('../models');
var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var authenticate = require('../oauth_authenticate')
var fecha = require('fecha');

router.post('/', authenticate({scope:'admin,user'}), function(req, res) {

  models.mt_tracking.create({
     latitude: req.body.latitude,
     longitude: req.body.longitude,
     data: fecha.format(new Date(), 'YYYY-MM-DD hh:mm:ss'),
     session_id: req.body.session_id
  }).then(function(loc) {
    res.json(loc);
  });

});

module.exports = router;
