(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    var Client = function(options) {
        this.options = options;
        this.status = new Backbone.Model();
        this.user = new w.Chattie.UserModel();
        //this.users = new UsersCollection();
        this.dialogs = new w.Chattie.DialogsCollection();
        this.events = _.extend({}, Backbone.Events);
        return this;
    };

    /* Messages */
    Client.prototype.addMessage = function (message) {
        var dialog = this.dialogs.get(message.dialog);
        if (!dialog || !message) {
            return;
        }
        dialog.set('lastActive', message.created);

        dialog.lastMessage.set(message);

        dialog.trigger('messages:new', message);
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

    /* Dialogs */
    Client.prototype.setDialogMembers = function(dialogId, members) {
        if (!dialogId || !members || !members.length) {
            return;
        }
        var dialog = this.dialogs.get(dialogId);
        if (!dialog) {
            return;
        }
        dialog.members.set(members);
    };

    Client.prototype.getDialogs = function(cb) {
        var self = this;
        this.io.emit('dialogs:list', { users: true }, function(dialogs) {

            self.dialogs.set(dialogs);

            _.each(dialogs, function(dialog) {
                if (dialog.users) {
                    self.setDialogMembers(dialog.id, dialog.users);
                }
            });

            if (cb) {
                cb(dialogs);
            }

        });
    };

    Client.prototype.switchDialog = function(id) {
        console.log('dialog switched to ' + id);

        this.dialogs.last.set('id', this.dialogs.current.get('id'));
        if (!id || id === 'bg') {
            this.dialogs.current.set('id', 'bg');
            this.router.navigate('!/', {
                replace: true
            });
            return;
        }
        var dialog = this.dialogs.get(id);
        if (dialog && dialog.get('joined')) {
            this.dialogs.current.set('id', id);
            this.router.navigate('!/dialog/' + dialog.id, {
                replace: true
            });
            return;
        } else {
            this.joinDialog(id, true);
        }
    };

    Client.prototype.addOrGetDialog = function(dialog) {
        var c = this.dialogs.get(dialog.id);
        if (c) {
            return c;
        }
        this.dialogs.add(dialog);
    };

    Client.prototype.joinDialog = function(id, switchToThisDialog, rejoin) {
        var self = this;

        if (!id) {
            return;
        }

        if (!rejoin) {
            var dialog = self.dialogs.get(id);
            if (dialog && dialog.get('joined')) {
                return;
            }
        }

        self.io.emit('dialogs:join', id, function(returnedDialog) {
            if (!returnedDialog) {
                return;
            }

            var dialog = self.addOrGetDialog(returnedDialog);
            dialog.set('joined', true);

            self.getMessages({
                dialog: dialog.id,
                since_id: dialog.lastMessage.get('id'),
                take: 50,
                expand: 'owner, dialog',
                reverse: true
            }, function(messages) {

                messages.reverse();
                self.addMessages(messages, !dialog.get('loaded'));
                dialog.set('loaded', true);
            });

            if (switchToThisDialog) {
                self.switchDialog(id);
            }

        });
    };

    Client.prototype.leaveDialog = function(id) {
        var dialog = this.dialogs.get(id);
        if (dialog) {
            dialog.set('joined', false);
            dialog.lastMessage.clear();
        }

        this.io.emit('dialogs:leave', id);

        if (id === this.dialogs.current.get('id')) {
            var dialog = this.dialogs.get(this.dialogs.last.get('id'));
            this.switchDialog(dialog && dialog.get('joined') ? dialog.id : 'bg');
        }
    };

    Client.prototype.updateDialog = function(dialog) {
        this.io.emit('dialogs:update', dialog);
    };

    Client.prototype.dialogUpdated = function(updatedDialog) {
        var dialog = this.dialogs.get(updatedDialog.id);
        if (!dialog) {
            return;
        }
        dialog.set(updatedDialog);
    };

    Client.prototype.createDialog = function(options) {
        var self = this;
        var dialog = {
            name: options.name,
            displayName: options.displayName,
            description: options.description
        };
        var callback = options.callback;
        self.io.emit('dialogs:create', dialog, function(dialog) {
            if (dialog && dialog.errors) {
                // TODO: информация об ошибке
                console.log('Невозможно создать диалог :( Уникальное имя не уникально :)');
            } else if (dialog && dialog.id) {
                self.addOrGetDialog(dialog);
                self.joinDialog(dialog.id, true);//self.switchDialog(dialog.id);
            }
            callback && callback(dialog);
        });
    };

    Client.prototype.archiveDialog = function(dialogId) {
        //console.log('archive dialog ' + dialogId);
        this.io.emit('dialogs:archive', dialogId);
    };

    Client.prototype.dialogArchived = function(dialog) {
        var self =this;
        // TODO: this is KOSTYL' :)
        setTimeout(function() {
            self.leaveDialog(dialog.id);
            self.dialogs.remove(dialog.id);
        }, 300);
        //this.leaveDialog(dialog.id);
        //this.dialogs.remove(dialog.id);
    };

    /* Base */
    Client.prototype.route = function() {
        var self = this;
        var Router = Backbone.Router.extend({
            routes: {
                '!/dialog/:id': 'switch'
            },
            switch: function(id) {
                if (!self.dialogs.get(id)) {
                    self.dialogs.last.set('id', self.dialogs.current.get('id'));
                    self.dialogs.current.set('id', 'bg');
                    self.router.navigate('!/', {
                        replace: true
                    });
                    return;
                }
                self.switchDialog(id);
            }
        });
        this.router = new Router();
        Backbone.history.start();
    };

    Client.prototype.listen = function() {
        var self = this;

        // helper
        function joinDialogs(dialogs) {

            var dialogsIds = _.map(dialogs, function(dialog) {
                return dialog.id;
            });

            _.each(dialogsIds, function(dialogId) {
                self.joinDialog(dialogId);
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
            self.getDialogs(joinDialogs);
            self.status.set('connected', true);
        });

        this.io.on('disconnect', function() {
            console.log('disconnected...');
            self.status.set('connected', false);
        });

        this.io.on('messages:new', function(message) {
            self.addMessage(message);
        });

        this.io.on('dialogs:new', function(dialog) {
            self.addOrGetDialog(dialog);
            self.joinDialog(dialog.id); // TODO: не входить в созданный диалог! добавить кнопку для просмотра всех диалогов
        });

        this.io.on('dialogs:updated', function(dialog) {
            self.dialogUpdated(dialog);
        });

        this.io.on('dialogs:archived', function(dialog) {
            self.dialogArchived(dialog);
        });

        /* GUI */
        this.events.on('messages:send', this.sendMessage, this);
        this.events.on('dialogs:switch', this.switchDialog, this);
        this.events.on('dialogs:leave', this.leaveDialog, this);
        this.events.on('dialogs:update', this.updateDialog, this);
        this.events.on('dialogs:create', this.createDialog, this);
        this.events.on('dialogs:archive', this.archiveDialog, this);
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