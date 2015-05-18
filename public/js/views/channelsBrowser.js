(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.ChannelsBrowserView = Backbone.View.extend({
        initialize: function(options) {
            this.client = options.client;
            this.channels = options.client.channels;
            this.channelTemplate = Handlebars.compile($('#template-channel').html());

            this.channelsViews = {}; // {'id' : 'channelView'}

            this.channels.on('change:joined', function(channel, joined) {
                if (joined) {
                    this.add(channel);
                    return;
                }
                this.remove(channel.id);
            }, this);

            this.channels.current.on('change:id', function(current, id) {
                this.switch(id);
            }, this);

            this.switch(this.channels.current.get('id'));
        },

        hide: function() {
            this.$el.find('#c-channels').hide();
            this.$el.find('#c-background').show();
        },

        show: function() {
            this.$el.find('#c-background').hide();
            this.$el.find('#c-channels').show();
        },

        add: function(channel) {
            if (this.channelsViews[channel.id]) {
                return;
            }

            this.channelsViews[channel.id] = new w.Chattie.ChannelView({
                client: this.client,
                template: this.channelTemplate,
                model: channel
            });

            this.$el.find('#c-channels').append(this.channelsViews[channel.id].$el);
        },

        remove: function(id) {
            if (!this.channelsViews[id]) {
                return;
            }

            this.channelsViews[id].remove();
            delete this.channelsViews[id];
        },

        switch: function(id) {

            if (!id) {
                this.hide();
                return;
            }

            var $channel = this.$el.find('.c-channel[data-id=' + id + ']');
            $channel.show().siblings().hide();
            $channel.find('[autofocus]').focus();
            this.show();
            this.channelsViews[id] && this.channelsViews[id].scrollMessages();
        }

    });


}) (window, $, _);