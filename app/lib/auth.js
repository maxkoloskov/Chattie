var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./mongoose').model('User');

passport.use(new LocalStrategy(
    function(username, password, done) {

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
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});

module.exports = passport;