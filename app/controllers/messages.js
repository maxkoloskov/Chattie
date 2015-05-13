var requireAuth = require('./../middlewares/requireAuth');

module.exports = function(opts) {
    var app = opts.app;
    var io = opts.io;
    var core = opts.core;

    /* Core */
    core.on('messages:new', function(message, channel, user) {
        var msg = message.toJSON();
        msg.owner = user;
        msg.channel = channel;

        io.to(channel._id).emit('messages:new', msg);
    });

    /* Routes */

    /* Socket */
    io.on('connection', function(socket) {
        socket.on('messages:create', function(cb) {
            var options = {
                owner: req.user._id,
                room: req.param('room'),
                text: req.param('text')
            };

            core.messages.create(options, function(err, message) {
                if (err) {
                    cb(false);
                }
                cb(true); // message created successful
            });
        });

        socket.on('messages:list', function(query, cb) {
            var options = {
                channel: query.channel,
                since_id: query.since_id,
                from: query.from,
                to: query.to,
                query: query.query,
                reverse: query.reverse,
                skip: query.skip,
                take: query.take,
                expand: query.expand
            };

            core.messages.list(options, function(err, messages) {
                if (err) {
                    return cb([]);
                }
                cb(messages);
            });
        });
    });
};