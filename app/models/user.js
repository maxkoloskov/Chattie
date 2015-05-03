var mongoose = require('../lib/mongoose');
var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        match: /^[^\.][a-z0-9_\.]+[^\.]$/i
    },
    hashedPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String,
        required: true
    },
    created: {
        type: Date,
        default: Date.now
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
});

/* Virtuals */
UserSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashedPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

/* Methods*/
UserSchema.methods = {
    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },
    encryptPassword: function (password) {
        if (!password) return '';
        return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
    },
    authenticate: function (password) {
        return this.hashedPassword === this.encryptPassword(password);
    }
};

UserSchema.method('toJSON', function() {
    return {
        id: this._id,
        username: this.username,
        created: this.created
    };
});

/* Statics */
UserSchema.statics = {
    authorize: function (username, password, callback) {
        this.findOne({username: username}, function (err, user) {
            if (err) callback(err);
            if (user && user.authenticate(password)) {
                callback(null, user);
            } else {
                callback(null, false); // AuthError
            }
        });
    }
};

exports.User = mongoose.model('User', UserSchema);