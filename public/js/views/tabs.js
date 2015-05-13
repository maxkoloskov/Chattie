(function(w, $, _) {

    w.Chattie = w.Chattie || {};

    w.Chattie.TabsView = Backbone.View.extend({
        focus: true,
        initialize: function (options) {
            this.client = options.client;
            this.template = Handlebars.compile($('#template-channel-tab').html());
            this.channels = options.channels;

            //this.channels.on('change:joined', function (channel, joined) {
            //    if (joined) {
            //        this.add(channel.toJSON());
            //        return;
            //    }
            //    this.remove(channel.id);
            //}, this);

            this.channels.on('change:displayName change:description', this.update, this);

            this.channels.current.on('change:id', function (current, id) {
                this.switch(id);
                this.clearAlerts(id);
            }, this);


            this.channels.on('messages:new', this.alert, this);

            this.switch(this.channels.current.get('id'));

            $(w).on('focus blur', _.bind(this.onFocusBlur, this));
            this.render();
        },

        add: function (channel) {
            this.$el.append(this.template(channel));
        },

        remove: function (id) {
            this.$el.find('.c-channel-tab[data-id=' + id + ']').remove();
        },

        update: function (channel) {
            this.$el.find('.c-channel-tab[data-id=' + channel.id + '] .c-channel-tab-title').text(channel.get('displayName'));
        },

        switch: function (id) {
            if (!id) {
                return;
            }
            this.$el.find('.c-channel-tab').removeClass('active')
                .filter('[data-id=' + id + ']').addClass('active');
        },

        alert: function (message) {
            var $tab = this.$('.c-channel-tab[data-id=' + message.channel.id + ']'),
                $alerts = $tab.find('c-channel-tab-alerts');

            if ($tab.length === 0 || ((this.rooms.current.get('id') === message.room.id) && this.focus)) {
                return;
            }
            var alertsCnt = parseInt($tab.data('count-total')) || 0;

            $tab.data('alerts-count', ++alertsCnt);
            $alerts.text(alertsCnt);
        },

        clearAlerts: function (id) {
            var $tab = this.$('.c-channel-tab[data-id=' + id + ']'),
                $alerts = $tab.find('c-channel-tab-alerts');

            $tab.data('alerts-count', 0);
            $alerts.text('');
        },

        onFocusBlur: function (e) {
            var self = this;
            this.focus = (e.type === 'focus');
            clearTimeout(this.clearTimer);
            if (this.focus) {
                this.clearTimer = setTimeout(function () {
                    self.clearAlerts(self.channels.current.get('id'));
                }, 1000);
                return;
            }
            self.clearAlerts(self.channels.current.get('id'));
        }
    });

}) (window, $, _);