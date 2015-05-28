(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.ChannelView = Backbone.View.extend({
        events: {
            'keypress .c-msg-input': 'sendMessage',
            'click .c-channel-edit': 'showEditChannel',
            'click .c-save-edit-channel': 'saveEditChannel',
            'click .c-archive-channel': 'archiveChannel'
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
                channel: this.model.id,
                text: $input.val().trim()
            });
            $input.val('');
        },

        /* Channel*/
        updateInfo: function() {
            this.$('.c-channel-header .c-channel-title').text(this.model.get('displayName'));
            this.$('.c-channel-header .c-channel-topic').text(this.model.get('description'));
            //this.$('.c-channel-header .name').text('#' + this.model.get('name'));
        },

        showEditChannel: function() {
            this.$('.c-edit-channel-modal').modal();
        },

        saveEditChannel: function() {
            var $displayName = this.$('.c-edit-channel-modal input.c-channel-displayname-input');
            var $description = this.$('.c-edit-channel-modal input.c-channel-description-input');

            if (!$displayName.val().trim()) {
                $displayName.parent().addClass('has-error');
                return;
            }

            $displayName.parent().removeClass('has-error');

            this.client.events.trigger('channels:update', {
                id: this.model.id,
                displayName: $displayName.val().trim(),
                description: $description.val().trim()
            });

            this.$('.c-edit-channel-modal').modal('hide');
        },

        archiveChannel: function() {
            // TODO: запросить подтверждение
            this.$('.c-edit-channel-modal').modal('hide');
            this.client.events.trigger('channels:archive', this.model.id);
        }

    });


}) (window, $, _);