var mongoose = require('../lib/mongoose');

function AccountManager(options) {
    this.core = options.core;
}

AccountManager.prototype.create = function (options, cb) {
    var User = mongoose.model('User');
    User.create(options, cb);
};

//AccountManager.prototype.update = function (options, cb) {
//};

module.exports = AccountManager;