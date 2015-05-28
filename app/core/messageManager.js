var _ = require('lodash'),
    mongoose = require('../lib/mongoose'),
    helpers = require('./helpers');

function MessageManager(options) {
    this.core = options.core;
}

// new message create
MessageManager.prototype.create = function(options, cb) {
    var Message = mongoose.model('Message'),
        Dialog = mongoose.model('Dialog'),
        User = mongoose.model('User');

    var self = this;

    Dialog.findById(options.dialog, function(err, dialog) {
        if (err) {
            return cb(err);
        }
        if (!dialog) {
            return cb('Dialog does not exist.');
        }
        Message.create(options, function(err, message) {
            if (err) {
                return cb(err);
            }

            dialog.lastActive = message.created;
            dialog.save();

            User.findById(message.owner, function(err, user) {
                if (err) {
                    return cb(err);
                }
                typeof cb === 'function' && cb(null, message, dialog, user);
                self.core.emit('messages:new', message, dialog, user);
            });
        });
    });
};

// get list of messages
MessageManager.prototype.list = function(options, cb) {
    options = options || {};

    if (!options.dialog) {
        return cb(null, []);
    }

    options = helpers.dbQuerySanitize(options, {
        defaults: {
            reverse: true,
            take: 500
        },
        maxTake: 5000
    });

    var Message = mongoose.model('Message'),
        User = mongoose.model('User');

    var find = Message.find({
        dialog: options.dialog
    });

    if (options.since_id) {
        find.where('_id').gt(options.since_id);
    }

    if (options.from) {
        find.where('created').gt(options.from);
    }

    if (options.to) {
        find.where('created').lte(options.to);
    }

    if (options.query) {
        find = find.find({$text: {$search: options.query}});
    }

    if (options.expand) {
        var includes = options.expand.replace(/\s/, '').split(',');

        if (_.includes(includes, 'owner')) {
            find.populate('owner', 'id username fullname avatar');
        }

        if (_.includes(includes, 'dialog')) {
            find.populate('dialog', 'id name displayName');
        }
    }

    if (options.skip) {
        find.skip(options.skip);
    }

    if (options.reverse) {
        find.sort({ 'created': -1 });
    } else {
        find.sort({ 'created': 1 });
    }

    find.limit(options.take)
        .exec(function(err, messages) {
            if (err) {
                console.error(err);
                return cb(err);
            }
            cb(null, messages);
        });
};

module.exports = MessageManager;