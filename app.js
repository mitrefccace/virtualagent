//var config = require('./private/config.json');
var config = require('/home/centos/dat/config.json');
var decode = require('./decode');
var express = require('express');
var path = require('path');
var mysql = require('mysql');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');

var app = express();

// Create MySQL connection and connect to the database
var connection = mysql.createConnection({
  host: decode(config.database_servers.mysql.host),
  port: decode(config.database_servers.mysql.port),
  user: decode(config.database_servers.mysql.user),
  password: decode(config.database_servers.mysql.password),
  database: decode(config.database_servers.mysql.videomail_database_name)
});

connection.connect(function (err) {
  if (err) {
	console.log(err)
    console.log("MySQL Connection Error");
    process.exit(1); // Exit on MySQL error
  } else {
    console.log("Connected to MySQL");
  }
});

// Keeps connection from Inactivity Timeout
setInterval(function () {
  connection.ping();
}, 60000);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// Make the db accessible to routes
app.use(function(req,res,next){
    req.mysql = connection;
    next();
});

app.use('/', index);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
