var passport = require('passport');
var passportSocketIo = require('passport.socketio');
var LocalStrategy = require('passport-local').Strategy;

var mongoose = require('./mongoose');
var _ = require('lodash');

function setup(app, io, sessionOpts) {

    function localAuth(username, password, done) {
        var User = mongoose.model('User');
        User.authorize(username, password, function(err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false);
            }
            return done(null, user);
        });
    }

    passport.use(new LocalStrategy(localAuth));

    passport.serializeUser(function(user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function(id, done) {
        var User = mongoose.model('User');
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });

    app.use(passport.initialize());
    app.use(passport.session());

    sessionOpts = _.extend(sessionOpts, {
        passport: passport
    });

    io.use(passportSocketIo.authorize(sessionOpts));
}

function authenticate(req, res, cb) {

    cb = cb || function(err, user, info) {
        if (err || !user) {
            return res.redirect('/');
        }
        req.logIn(user, function(err) {
            return res.redirect('/');
        });
    };

    passport.authenticate('local', cb)(req, res);
}

module.exports = {
    setup: setup,
    authenticate: authenticate
};