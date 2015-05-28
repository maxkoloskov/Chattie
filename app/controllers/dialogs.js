var requireAuth = require('./../middlewares/requireAuth');

module.exports = function(opts) {
    var app = opts.app;
    var io = opts.io;
    var core = opts.core;

    /* Core */
    core.on('dialogs:new', function(dialog) {
        io.emit('dialogs:new', dialog);
    });

    core.on('dialogs:update', function(dialog) {
        io.emit('dialogs:updated', dialog);
    });

    core.on('dialogs:archive', function(dialog) {
        io.emit('dialogs:archived', dialog);
    });

    /* Routes */
    app.route('/dialogs')
        .all(requireAuth);
        //.get(function(req, res) {
        //    res.end('dialogs:list');
        //});
        //.post(function(req, res) {
        //     res.end('dialogs:create');
        //});


    /* Sockets */
    io.on('connection', function (socket) {

        // dialogs -> list
        socket.on('dialogs:list', function(query, cb) {
            var options = {
                skip: query.skip,
                take: query.take
            };

            core.dialogs.list(options, function(err, dialogs) {
                if (err) {
                    console.log(err);
                    cb([]);
                }
                cb(dialogs);
            });
        });

        // dialogs -> create
        socket.on('dialogs:create', function(options, cb) {
            options.owner = socket.request.user.id;
            core.dialogs.create(options, function(err, dialog) {
                if (err) {
                    return cb({errors: true});
                }
                cb(dialog);
            });
        });

        // dialogs -> archive
        socket.on('dialogs:archive', function(dialogId, cb) {
            core.dialogs.archive(dialogId, function(err, dialog) {
                if (err) {
                    console.log(err);
                }
            });
        });

        // dialogs -> update
        socket.on('dialogs:update', function(options, cb) {
            var dialogId = options.id;
            var updateOpts = {
                displayName: options.displayName,
                description: options.description
            };

            core.dialogs.update(dialogId, updateOpts, function(err, dialog) {
                if (err) console.log(err);
            });
        });

        // dialogs -> join
        socket.on('dialogs:join', function(dialogId, cb) {
            core.dialogs.getById(dialogId, function(err, dialog) {

                if (err) {
                    console.log(err);
                    cb('');
                }

                if (!dialog) {
                    cb('');
                }

                socket.join(dialogId);
                cb(dialog.toJSON());
            });
        });

        // dialogs -> leave
        socket.on('dialogs:leave', function(dialogId) {
            socket.leave(dialogId);
        });

    });
};