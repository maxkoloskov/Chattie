(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.ClientView = Backbone.View.extend({
        el: '#c-client-ui',
        initialize: function(options) {
            this.client = options.client;

            /* Subviews */

            // messages
            //this.chat = new w.Chattie.ChatView({
            //    el: this.$el.find('#c-messages-container'),
            //    client: this.client
            //});

            //channels tabs
            this.tabs = new w.Chattie.TabsView({
                el: this.$el.find('#c-channels-list'),
                channels: this.client.channels,
                client: this.client
            });

            // channel info view
            this.channel = new w.Chattie.ChannelHeaderView({
                el: this.$el.find('#c-channel-header'),
                channels: this.client.channels,
                client: this.client
            });

            // input
            this.input = new w.Chattie.InputView({
                el: this.$el.find('#c-msg-input-container'),
                client: this.client
            });

            // online/offline
            this.status = new w.Chattie.ConnectionIndicatorsView({
                el: this.$el.find('#c-connection-indicators'),
                client: this.client
            });

            return this;
        }
    });
})(window, $, _);