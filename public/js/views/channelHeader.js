(function(w, $, _) {

    w.Chattie = w.Chattie || {};

    w.Chattie.ChannelHeaderView = Backbone.View.extend({
        focus: true,
        initialize: function (options) {
            this.client = options.client;
            this.channels = options.channels;

            this.channels.on('change:displayName change:description', this.update, this);

            this.channels.current.on('change:id', function (current, id) {
                this.switch();
            }, this);

            this.switch(this.channels.current.get('id'));

        },

        update: function (channel) {
            if (channel.id === this.channels.current.get('id')) {
                this.switch(channel.id);
            }
        },

        switch: function (id) {
            //var channel = this.channels.get(id);
            if (!id) return;
            this.$el.find('.c-channel-title').text(this.channels.get(id).get('displayName'));
            this.$el.find('.c-channel-topic').text(this.channels.get(id).get('description'));
        }
    });

}) (window, $, _);