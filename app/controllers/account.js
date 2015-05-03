module.exports = function(opts) {
    var app = opts.app;
    var io = opts.io;

    app.get('/', function(req, res) {
        res.render('chat');
    });

    app.get('/login', function(req, res) {
        res.render('login');
    });

    app.get('/logout', function(req, res) {
        req.session.destroy();
        res.redirect('/login');
    });
};