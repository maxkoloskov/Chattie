var requireAuth = require('./../middlewares/requireAuth');
var auth = require('./../lib/auth');

module.exports = function(opts) {
    var app = opts.app;
    var io = opts.io;

    /* Routes */
    app.get('/', requireAuth, function(req, res) {
        res.render('chat', {
            user: req.user
        });
    });

    app.get('/login', function(req, res) {
        res.render('login');
    });

    app.get('/logout', function(req, res) {
        req.session.destroy();
        res.redirect('/login');
    });

    app.post('/account/login', function(req, res) {
        // TODO: коллбэк в третьем параметре
        auth.authenticate(req, res);
    });

    app.get('/account', requireAuth, function(req, res) {
        res.json(req.user);
    });

    app.get('/profile/:username', requireAuth, function(req, res) {
        // TODO: запросить реального пользователя
        res.render('profile', {
            profile: {
                username: 'username',
                fullname: 'Full Name',
                avatar: 'default.jpg'
            }
        });
    });

    /* Sockets */
    io.on('connection', function(socket) {
        socket.on('account:get', function(cb) {
            cb(socket.request.user);
        });

    });
};