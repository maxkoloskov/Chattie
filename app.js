var express = require('express'),
    http = require('http'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    mongoose = require('mongoose'),
    logger = require('morgan');

var config = require('./app/config');

var app = express();

/* Logger */
if (config.get('env') === 'dev') {
    app.use(logger('dev'));
}

/* MongoDB */
var connect = function () {
    mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'));
};
connect();
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

/* HTTP */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* Sessions */
app.use(session({
    secret: config.get('session:secret'),
    cookie: config.get('session:cookie'),
    name: config.get('session:name'),
    resave: config.get('session:resave'),
    saveUninitialized: config.get('session:saveUninitialized'),
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

/* Views and static */
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

/* Controllers */


/* Start server */
var port = config.get('http:port') || 3000;
http.createServer(app).listen(port);
console.log('Listening on port ' + port);