var requireAuth = require('./../middlewares/requireAuth');

module.exports = function(opts) {
    var app = opts.app;
    var io = opts.io;
    var core = opts.core;

    /* Core */
    core.on('messages:new', function(message, dialog, user) {
        var msg = message.toJSON();
        msg.owner = user;
        msg.dialog = dialog;

        io.to(dialog._id).emit('messages:new', msg);
    });

    /* Routes */

    /* Socket */
    io.on('connection', function(socket) {
        socket.on('messages:create', function(message, cb) {
            var options = {
                owner: socket.request.user.id,
                dialog: message.dialog,
                text: message.text
            };

            core.messages.create(options, function(err) {
                if (err) {
                    console.error(err);
                }
            });
        });

        socket.on('messages:list', function(query, cb) {
            var options = {
                dialog: query.dialog,
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