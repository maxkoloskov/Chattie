var requireAuth = require('./../middlewares/requireAuth');

module.exports = function(opts) {
    var app = opts.app;
    var io = opts.io;
    var core = opts.core;

    /* Core */
    core.on('channels:new', function(channel) {
        io.emit('channels:new', channel);
    });

    core.on('channels:update', function(channel) {
        io.emit('channels:updated', channel);
    });

    core.on('channels:archive', function(channel) {
        io.emit('channels:archived', channel);
    });

    /* Routes */
    app.route('/channels')
        .all(requireAuth);
        //.get(function(req, res) {
        //    res.end('channels:list');
        //});
        //.post(function(req, res) {
        //     res.end('channels:create');
        //});


    /* Sockets */
    io.on('connection', function (socket) {

        // channels -> list
        socket.on('channels:list', function(query, cb) {
            var options = {
                skip: query.skip,
                take: query.take
            };

            core.channels.list(options, function(err, channels) {
                if (err) {
                    console.log(err);
                    cb([]);
                }
                cb(channels);
            });
        });

        // channels -> create
        socket.on('channels:create', function(options, cb) {
            options.owner = socket.request.user.id;
            core.channels.create(options, function(err, channel) {
                if (err) {
                    return cb({errors: true});
                }
                cb(channel);
            });
        });

        // channels -> archive
        socket.on('channels:archive', function(channelId, cb) {
            core.channels.archive(channelId, function(err, channel) {
                if (err) {
                    console.log(err);
                }
            });
        });

        // channels -> update
        socket.on('channels:update', function(options, cb) {
            var channelId = options.id;
            var updateOpts = {
                displayName: options.displayName,
                description: options.description
            };

            core.channels.update(channelId, updateOpts, function(err, channel) {
                if (err) console.log(err);
            });
        });

        // channels -> join
        socket.on('channels:join', function(channelId, cb) {
            core.channels.getById(channelId, function(err, channel) {

                if (err) {
                    console.log(err);
                    cb('');
                }

                if (!channel) {
                    cb('');
                }

                socket.join(channelId);
                cb(channel.toJSON());
            });
        });

        // channels -> leave
        socket.on('channels:leave', function(channelId) {
            socket.leave(channelId);
        });

    });
};