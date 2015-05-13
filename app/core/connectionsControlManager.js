var _ = require('lodash'),
    Connection = require('./connectionsControl/connection'),
    ConnectionCollection = require('./connectionsControl/connectionCollection');
    //RoomCollection = require('./presence/room-collection'),
    //UserCollection = require('./presence/user-collection');

function ConnectionsControlManager(options) {
    this.core = options.core;
    this.connections = new ConnectionCollection();
}

module.exports = ConnectionsControlManager;