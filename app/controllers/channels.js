var requireAuth = require('./../middlewares/requireAuth');

module.exports = function(opts) {
    var app = opts.app;
    var io = opts.io;
    var core = opts.core;

    /* Core */
    core.on('channels:new', function(channel) {
        io.emit('channel:new', channel);
    });

    /* Routes */
    //app.route('/channels')
    //    .all(requireAuth);
    //    .get(function(req, res) {
    //        ('channels:list');
    //    })
    //    .post(function(req, res) {
    //        ('channels:create');
    //    });


    /* Sockets */
    io.on('connection', function (socket) {

        socket.on('channels:list', function(query, cb) {

            var options = {
                skip: query.skip,
                take: query.take
            };

            core.channels.list(options, function(err, channels) {

                cb(channels);
            });

        });

    });
};