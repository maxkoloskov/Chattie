var EventEmitter = require('events').EventEmitter,
    util = require('util'),
    MessageManager = require('./messageManager'),
    ChannelManager = require('./channelManager'),
    AccountManager = require('./accountManager');

function Core() {
    EventEmitter.call(this);

    this.account = new AccountManager({
        core: this
    });

    this.messages = new MessageManager({
        core: this
    });

    this.channels = new ChannelManager({
        core: this
    });
}

util.inherits(Core, EventEmitter);

module.exports = new Core();