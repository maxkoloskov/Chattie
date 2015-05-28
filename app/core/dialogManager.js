var mongoose = require('../lib/mongoose'),
    helpers = require('./helpers');

function DialogManager(options) {
    this.core = options.core;
}

DialogManager.prototype.create = function (options, cb) {
    var self = this;
    var Dialog = mongoose.model('Dialog');
    Dialog.create(options, function(err, dialog) {
        if (err) {
            return cb(err);
        }

        cb(null, dialog);

        self.core.emit('dialogs:new', dialog);
    });
};

DialogManager.prototype.update = function(dialogId, options, cb) {
    var self = this;
    var Dialog = mongoose.model('Dialog');
    Dialog.findById(dialogId, function(err, dialog) {
        if (err) {
            return cb(err);
        }
        if (!dialog) {
            return cb('Dialog does not exist'); // 400
        }

        dialog.displayName = options.displayName;
        dialog.description = options.description;

        dialog.save(function(err, dialog) {
            if (err) {
                return cb(err);
            }
            cb(null, dialog);

            self.core.emit('dialogs:update', dialog);
        });
    });
};

DialogManager.prototype.archive = function(dialogId, cb) {
    var self = this;
    var Dialog = mongoose.model('Dialog');
    Dialog.findById(dialogId, function(err, dialog) {
        if (err) {
            return cb(err);
        }
        if (!dialog) {
            return cb('Dialog does not exist'); // 400
        }

        dialog.isArchived = true;

        dialog.save(function(err, dialog) {
            if (err) {
                return cb(err);
            }
            cb(null, dialog);

            self.core.emit('dialogs:archive', dialog);
        });
    });
};

DialogManager.prototype.list = function(options, cb) {
    options = options || {};

    options = helpers.dbQuerySanitize(options, {
        defaults: {
            take: 500
        },
        maxTake: 5000
    });

    var Dialog = mongoose.model('Dialog');

    var find = Dialog.find({ isArchived: { $ne: true }});

    if (options.skip) {
        find.skip(options.skip);
    }

    if (options.take) {
        find.limit(options.take);
    }

    if (options.sort) {
        var sort = options.sort.replace(',', ' ');
        find.sort(sort);
    }

    find.exec(cb);
};

DialogManager.prototype.getById = function(id, cb) {
    var Dialog = mongoose.model('Dialog');
    Dialog.findOne({
        _id: id
    }, cb);
};

DialogManager.prototype.getByName = function(name, cb) {
    var Dialog = mongoose.model('Dialog');
    Dialog.findOne({
        name: name
    }, cb);
};

module.exports = DialogManager;