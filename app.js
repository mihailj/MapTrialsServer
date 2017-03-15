var app_config = require('./config/app_config');

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

var authenticate = require('./oauth_authenticate')

var index = require('./routes/index');
var users = require('./routes/users');
var locations = require('./routes/locations');
var objectives = require('./routes/objectives');
var completion = require('./routes/completion');
var messages = require('./routes/messages');

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

app.get('/test-fcm', function(req, res, next) {
  /*res.render('index', { title: 'Nothing to see here, please move along.' });*/

  var FCM = require('fcm-node');

  var serverKey = app_config.firebase.auth_key;
  var fcm = new FCM(serverKey);

  var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
      to: app_config.firebase.device_id,
      /*collapse_key: 'your_collapse_key',*/

      /*notification: {
          title: 'Title of your push notification',
          body: 'Body of your push notification'
      },*/

      data: {  //you can send only notification or only data(or include both)
          /*my_key: 'my value',
          my_another_key: 'my another value'*/
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

  /*
  var request = require('request');
  console.error('aaaa');
  function sendMessageToUser(deviceId, message) {
    request({
      url: 'https://fcm.googleapis.com/fcm/send',
      method: 'POST',
      headers: {
        'Content-Type' :'application/json',
        'Authorization': 'key=' + app_config.firebase.auth_key
      },
      body: JSON.stringify(
        { "data": {
          "message": message
        },
          "to" : deviceId
        }
      )
    }, function(error, response, body) {
      if (error) {
        console.error(error, response, body);
      }
      else if (response.statusCode >= 400) {
        console.error('HTTP Error: '+response.statusCode+' - '+response.statusMessage+'\n'+body);
      }
      else {
        console.log('Done!')
      }
    });

  sendMessageToUser(
    app_config.firebase.device_id,
    { message: 'Hello puf'}
  );
}*/
});

app.use('/uploads', express.static('uploads'));

app.use('/', index);
app.use('/users', users);
app.use('/locations', locations);
app.use('/objectives', objectives);
app.use('/completion', completion);
app.use('/messages', messages);

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
