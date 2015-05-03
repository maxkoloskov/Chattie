var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cookieParser = require('cookie-parser'),
    session = require('express-session'),
    MongoStore = require('connect-mongo')(session),
    logger = require('morgan');

var config = require('./app/config'),
    mongoose = require('./app/lib/mongoose');

var app = express();

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

/* Views and static */
app.set('views', path.join(__dirname, 'app/views'));
app.set('view engine', 'jade');
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

/* Controllers */


module.exports = app;