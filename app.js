var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    logger = require('morgan'),
    _ = require('lodash');

var models = require('./app/models');

var config = require('./app/config'),
    auth = require('./app/lib/auth'),
    mongoose = require('./app/lib/mongoose');

var app = express();

/* io setup */
app.io = require('socket.io')();

/* Logger */
if (config.env === 'dev') {
    app.use(logger('dev'));
}

/* HTTP */
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(function(req, res, next) {
    res.setHeader('X-Powered-By', 'Chattie');
    next();
});

/* Sessions */
app.use(session({
    secret: config.session.secret,
    cookie: config.session.cookie,
    name: config.session.name,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

/* Passport auth */
app.use(auth.initialize());
app.use(auth.session());

/* Views and static */
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

/* Controllers */
var controllers = require('./app/controllers');
_.each(controllers, function(controller) {
    controller({
        app: app,
        io: app.io
    });
});

module.exports = app;