var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    logger = require('morgan'),
    _ = require('lodash');

var core = require('./app/core'),
    models = require('./app/models'),
    controllers = require('./app/controllers');


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
var sessionOpts = {
    secret: config.session.secret,
    cookie: config.session.cookie,
    key: config.session.key,
    resave: config.session.resave,
    saveUninitialized: config.session.saveUninitialized,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
};

app.use(session(sessionOpts));

/* Auth */
auth.setup(app, app.io, sessionOpts);

/* Views and static */
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
app.use(express.static(path.join(__dirname, 'public')));

/* Controllers */
_.each(controllers, function(controller) {
    controller({
        app: app,
        io: app.io,
        core: core
    });
});

module.exports = app;