var mongoose = require('../lib/mongoose'),
    helpers = require('./helpers');

function ChannelManager(options) {
    this.core = options.core;
}

ChannelManager.prototype.create = function (options, cb) {
    var self = this;
    var Channel = mongoose.model('Channel');
    Channel.create(options, function(err, channel) {
        if (err) {
            return cb(err);
        }

        if (cb) {
            cb(null, channel);
            self.core.emit('channels:new', channel);
        }
    });
};

ChannelManager.prototype.list = function(options, cb) {
    options = options || {};

    options = helpers.dbQuerySanitize(options, {
        defaults: {
            take: 500
        },
        maxTake: 5000
    });

    var Channel = mongoose.model('Channel');

    var find = Channel.find();

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

ChannelManager.prototype.getById = function(id, cb) {
    var Channel = mongoose.model('Channel');
    Channel.findOne({
        _id: id
    }, cb);
};

ChannelManager.prototype.getByName = function(name, cb) {
    var Channel = mongoose.model('Channel');
    Channel.findOne({
        name: name
    }, cb);
};

module.exports = ChannelManager;