(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    // Client
    var Client = function(options) {
        this.options = options;
        this.status = new Backbone.Model();
        this.user = new w.Chattie.UserModel();
        //this.users = new UsersCollection();
        this.channels = new w.Chattie.ChannelsCollection();
        this.events = _.extend({}, Backbone.Events);
        return this;
    };

    Client.prototype.addMessage = function (message) {

    };

    Client.prototype.sendMessage = function (message) {
        //this.io.emit('messages:create', message);
        console.log(message);
    };

    Client.prototype.getUser = function() {
        var self = this;
        this.io.emit('account:get', function(user) {
            self.user.set(user);
        });
    };

    Client.prototype.setChannelMembers = function(channelId, members) {
        if (!channelId || !members || !members.length) {
            return;
        }
        var channel = this.channels.get(channelId);
        if (!channel) {
            return;
        }
        channel.members.set(members);
    };

    Client.prototype.getChannels = function(cb) {
        var self = this;
        this.io.emit('channels:list', { users: true }, function(channels) {
            console.log(channels);
            self.channels.set(channels);

            //console.log(self.channels.get('554f8a74704179e129faf89b').get('description'));

            _.each(channels, function(channel) {
                if (channel.users) {
                    self.setChannelMembers(channel.id, channel.users);
                }
            });

            if (cb) {
                cb(channels);
            }

        });
    };

    Client.prototype.switchChannel = function(id) {
        //console.log('channel switched to ' + id);
        //return;
        this.channels.last.set('id', this.channels.current.get('id'));
        if (!id) {
            this.router.navigate('!/', {
                replace: true
            });
            return;
        }
        var channel = this.channels.get(id);
        if (channel) {
            this.channels.current.set('id', id);
            this.router.navigate('!/channel/' + channel.id, {
                replace: true
            });
            return;
        } else {
            //this.joinRoom(id, true);
            console.log('sdg');
        }
    };

    Client.prototype.route = function() {
        var self = this;
        var Router = Backbone.Router.extend({
            routes: {
                '!/channel/:id': 'switch'
            },
            switch: function(id) {
                self.switchChannel(id);
            }
        });
        this.router = new Router();
        Backbone.history.start();
    };

    Client.prototype.listen = function() {
        var self = this;
        var path = '/' + _.compact(
            w.location.pathname.split('/').concat(['socket.io'])
        ).join('/');

        /* Socket */
        this.io = io.connect({
            path: path,
            reconnection: true,
            reconnectionDelay: 500,
            reconnectionDelayMax: 1000,
            timeout: 3000
        });

        this.io.on('connect', function() {
            console.log('connected...');
            self.getUser();
            self.getChannels();
            self.status.set('connected', true);
        });

        this.io.on('messages:new', function(message) {
            self.addMessage(message);
        });

        this.io.on('disconnect', function() {
            console.log('disconnected...');
            self.status.set('connected', false);
        });

        /* GUI */
        this.events.on('messages:send', this.sendMessage, this);
        this.events.on('channels:switch', this.switchChannel, this);
    };

    Client.prototype.start = function() {
        this.listen();
        this.route();
        this.view = new w.Chattie.ClientView({
            client: this
        });
        return this;
    };

    w.Chattie.Client = Client;
})(window, $, _);