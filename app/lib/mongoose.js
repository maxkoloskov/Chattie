var mongoose = require('mongoose');
var config = require('../config');

/* MongoDB */
var connect = function () {
    mongoose.connect(config.mongoose.uri, config.mongoose.options);
};
connect();
mongoose.connection.on('error', console.log);
mongoose.connection.on('disconnected', connect);

module.exports = mongoose;