(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    var Client = function(options) {
        this.options = options;
        this.status = new Backbone.Model();
        this.user = new w.Chattie.UserModel();
        //this.users = new UsersCollection();
        this.channels = new w.Chattie.ChannelsCollection();
        this.events = _.extend({}, Backbone.Events);
        return this;
    };

    /* Messages */
    Client.prototype.addMessage = function (message) {
        var channel = this.channels.get(message.channel);
        if (!channel || !message) {
            return;
        }
        channel.set('lastActive', message.created);

        channel.lastMessage.set(message);

        channel.trigger('messages:new', message);
    };

    Client.prototype.addMessages = function (messages, historical) {
        var self = this;

        _.each(messages, function(message) {
            if (historical) {
                message.historical = true;
            }
            self.addMessage(message);
        });
    };

    Client.prototype.sendMessage = function(message) {
        this.io.emit('messages:create', message);
    };

    Client.prototype.getMessages = function(query, callback) {
        this.io.emit('messages:list', query, callback);
    };

    /* Account */
    Client.prototype.getUser = function() {
        var self = this;
        this.io.emit('account:get', function(user) {
            self.user.set(user);
        });
    };

    /* Channels */
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

            self.channels.set(channels);

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
        console.log('channel switched to ' + id);

        this.channels.last.set('id', this.channels.current.get('id'));
        if (!id) {
            //this.router.navigate('!/', {
            //    replace: true
            //});
            return;
        }
        var channel = this.channels.get(id);
        if (channel && channel.get('joined')) {
            this.channels.current.set('id', id);
            this.router.navigate('!/channel/' + channel.id, {
                replace: true
            });
            return;
        } else {
            this.joinChannel(id, true);
        }
    };

    Client.prototype.addOrGetChannel = function(channel) {
        var c = this.channels.get(channel.id);
        if (c) {
            return c;
        }
        this.channels.add(channel);
    };

    Client.prototype.joinChannel = function(id, switchToThisChannel, rejoin) {
        var self = this;

        if (!id) {
            return;
        }

        if (!rejoin) {
            var channel = self.channels.get(id);
            if (channel && channel.get('joined')) {
                return;
            }
        }

        self.io.emit('channels:join', id, function(returnedChannel) {
            if (!returnedChannel) {
                return;
            }

            var channel = self.addOrGetChannel(returnedChannel);
            channel.set('joined', true);

            self.getMessages({
                channel: channel.id,
                since_id: channel.lastMessage.get('id'),
                take: 50,
                expand: 'owner, channel',
                reverse: true
            }, function(messages) {

                messages.reverse();
                self.addMessages(messages, !channel.get('loaded'));
                channel.set('loaded', true);
            });

            if (switchToThisChannel) {
                self.switchChannel(id);
            }

        });
    };

    Client.prototype.leaveChannel = function(id) {
        var channel = this.channels.get(id);
        if (channel) {
            channel.set('joined', false);
            channel.lastMessage.clear();
        }

        this.io.emit('channels:leave', id);

        if (id === this.channels.current.get('id')) {
            var channel = this.channels.get(this.channels.last.get('id'));
            this.switchChannel(channel && channel.get('joined') ? channel.id : '');
        }
    };

    Client.prototype.route = function() {
        var self = this;
        var Router = Backbone.Router.extend({
            routes: {
                '!/channel/:id': 'switch'
            },
            switch: function(id) {
                if (!self.channels.get(id)) {
                    self.router.navigate('!/', {
                        replace: true
                    });
                    return;
                }
                self.switchChannel(id);
            }
        });
        this.router = new Router();
        Backbone.history.start();
    };

    Client.prototype.listen = function() {
        var self = this;

        // helper
        function joinChannels(channels) {

            var channelsIds = _.map(channels, function(channel) {
                return channel.id;
            });

            _.each(channelsIds, function(channelId) {
                self.joinChannel(channelId);
            });
        }

        /* Socket */
        var path = '/' + _.compact(
            w.location.pathname.split('/').concat(['socket.io'])
        ).join('/');

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
            self.getChannels(joinChannels);
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
        this.events.on('channels:leave', this.leaveChannel, this);
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