var app_config = require('./config/app_config');

var fecha = require('fecha');
var express = require('express');
var multer  =   require('multer');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var oauthServer = require('oauth2-server');
var Request = oauthServer.Request;
var Response = oauthServer.Response;

var ws = require('nodejs-websocket');

var authenticate = require('./oauth_authenticate')

var index = require('./routes/index');
var users = require('./routes/users');
var locations = require('./routes/locations');
var objectives = require('./routes/objectives');
var completion = require('./routes/completion');
var messages = require('./routes/messages');
var settings = require('./routes/settings');
var tracking = require('./routes/tracking');
var tracking_sessions = require('./routes/tracking_sessions');

var rttServer = ws.createServer(function (conn) {
	console.log('New real time tracking connection established.', fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss'));
	conn.on('text', function (msg) {
		// simple object transformation (= add current time)
		var msgObj = JSON.parse(msg);
		msgObj.newDate = new Date().toLocaleTimeString();
		var newMsg = JSON.stringify(msgObj);

		// echo message including the new field to all connected clients
		rttServer.connections.forEach(function (conn) {
			conn.sendText(newMsg);
		});
	});
	conn.on('close', function (code, reason) {
		console.log('Real time tracking connection closed.', fecha.format(new Date(), 'YYYY-MM-DD HH:mm:ss'), 'code: ', code);
	});

	conn.on('error', function (err) {
		// only throw if something else happens than Connection Reset
		if (err.code !== 'ECONNRESET') {
			console.log('Error in real time tracking Socket connection', err);
			throw  err;
		}
	})
}).listen(3005, function () {
	console.log('Real time tracking socketserver running on localhost:3005');
});

/*setInterval(function () {
	// Only emit numbers if there are active connections
	if (rttServer.connections.length > 0) {
	  //var randomNumber = (Math.floor(Math.random() * 10000) + 1).toString();
		//console.log(randomNumber);
		rttServer.connections.forEach((function (conn) {
			//conn.send(randomNumber)
      var str = JSON.stringify({ user_id: 2, latitude: 42.0121 + Math.random(), longitude: 20.1231 + Math.random() });
      console.log('random location data:');
      console.log(str);
      conn.send(str);
		}));
	}
}, 1000);*/

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var oauth = new oauthServer({
  model: require('./oauth_model.js')
});

app.options("/*", function(req, res, next){
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.sendStatus(200);
});

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

var storage = multer.diskStorage({
  destination: function (req, file, callback) {
	callback(null, './uploads');
  },
  filename: function (req, file, callback) {
	  console.log(file);
	callback(null, file.originalname);
  }
});
var upload = multer({ storage : storage}).single('file');

app.all('/oauth/token', function(req,res,next){
var request = new Request(req);
var response = new Response(res);

oauth
  .token(request,response)
  .then(function(token) {
	// Todo: remove unnecessary values in response
  token.ok = true;
	return res.json(token)
  }).catch(function(err){
	return res.status( 500).json(err)
  })
});

app.post('/authorise', function(req, res){
var request = new Request(req);
var response = new Response(res);

return oauth.authorize(request, response).then(function(success) {
	res.json(success)
}).catch(function(err){
  res.status(err.code || 500).json(err)
})
});


app.post('/upload', authenticate({scope:'admin,user'}), function(req,res){
upload(req,res,function(err) {
	if(err) {
		return res.end("Error uploading file.");
	}
	res.end("File is uploaded");
});
});

/*app.get('/test-fcm', function(req, res, next) {

  var FCM = require('fcm-node');

  var serverKey = app_config.firebase.auth_key;
  var fcm = new FCM(serverKey);

  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: app_config.firebase.device_id,

      data: {  //you can send only notification or only data(or include both)
          message: "test from nodejs"
      }
  };

  fcm.send(message, function(err, response){
      if (err) {
          console.log("Something has gone wrong!");
      } else {
          console.log("Successfully sent with response: ", response);
      }
  });

});*/

app.use('/uploads', express.static('uploads'));

app.use('/', index);
app.use('/users', users);
app.use('/locations', locations);
app.use('/objectives', objectives);
app.use('/completion', completion);
app.use('/messages', messages);
app.use('/settings', settings);
app.use('/tracking', tracking);
app.use('/tracking_sessions', tracking_sessions);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
