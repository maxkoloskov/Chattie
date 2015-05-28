(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.DialogView = Backbone.View.extend({
        events: {
            'keypress .c-msg-input': 'sendMessage',
            'click .c-dialog-edit': 'showEditDialog',
            'click .c-save-edit-dialog': 'saveEditDialog',
            'click .c-archive-dialog': 'archiveDialog'
        },

        initialize: function(options) {
            this.client = options.client;
            this.template = options.template;

            this.messageTemplate = Handlebars.compile($('#template-message').html());

            this.$el = $(this.template(this.model.toJSON()));
            this.$messages = this.$('.c-messages-container');

            this.model.on('messages:new', this.addMessage, this);
            this.model.on('change', this.updateInfo, this);
            //this.model.users.on('change', this.updateUsers, this);

        },

        /* Messages */
        addMessage: function(message) {
            var self = this;

            var messageCreated = moment(message.created);

            message.own = this.client.user.id === message.owner.id;
            message.isContinuation = this.lastMessageOwner === message.owner.id &&
                messageCreated.diff(this.lastMessageCreated, 'minutes') < 5;

            var $html = $(this.messageTemplate(message).trim());
            var $text = $html.find('.c-message-text');
            var $time = $html.find('time');

            moment.locale('ru');
            $time.text(moment($time.attr('title')).calendar());

            this.formatMessageText($text.html(), function(text) {
                $text.html(text);
                self.$messages.append($html);
                self.scrollMessages();
                self.lastMessageOwner = message.owner.id;
                self.lastMessageCreated = messageCreated;
            });
        },

        formatMessageText: function(text, cb) {
            //cb(text.
            //    replace(/&/g, '&amp;').
            //    replace(/</g, '&lt;').
            //    replace(/>/g, '&gt;')
            //);
            cb(text);
        },

        scrollMessages: function() {
            this.$messages[0].scrollTop = this.$messages[0].scrollHeight;
        },

        sendMessage: function(e) {
            if (e.keyCode !== 13 || e.altKey || e.ctrlKey) return;
            e.preventDefault();
            if (!this.client.status.get('connected')) return;
            var $input = this.$('.c-msg-input');
            if (!$input.val().trim()) return;
            this.client.events.trigger('messages:send', {
                dialog: this.model.id,
                text: $input.val().trim()
            });
            $input.val('');
        },

        /* Dialog*/
        updateInfo: function() {
            this.$('.c-dialog-header .c-dialog-title').text(this.model.get('displayName'));
            this.$('.c-dialog-header .c-dialog-topic').text(this.model.get('description'));
            //this.$('.c-dialog-header .name').text('#' + this.model.get('name'));
        },

        showEditDialog: function() {
            this.$('.c-edit-dialog-modal').modal();
        },

        saveEditDialog: function() {
            var $displayName = this.$('.c-edit-dialog-modal input.c-dialog-displayname-input');
            var $description = this.$('.c-edit-dialog-modal input.c-dialog-description-input');

            if (!$displayName.val().trim()) {
                $displayName.parent().addClass('has-error');
                return;
            }

            $displayName.parent().removeClass('has-error');

            this.client.events.trigger('dialogs:update', {
                id: this.model.id,
                displayName: $displayName.val().trim(),
                description: $description.val().trim()
            });

            this.$('.c-edit-dialog-modal').modal('hide');
        },

        archiveDialog: function() {
            // TODO: запросить подтверждение
            this.$('.c-edit-dialog-modal').modal('hide');
            this.client.events.trigger('dialogs:archive', this.model.id);
        }

    });


}) (window, $, _);