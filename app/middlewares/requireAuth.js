module.exports = function(req, res, next) {
    req.isAuthenticated && req.isAuthenticated()
        ? next()
        : res.redirect('/login');
};