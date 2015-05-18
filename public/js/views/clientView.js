(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.ClientView = Backbone.View.extend({
        el: '#c-client-ui',
        initialize: function(options) {
            this.client = options.client;

            /* SUBVIEWS */

            /* ChannelsBrowser */
            this.channelsBrowser = new w.Chattie.ChannelsBrowserView({
                el: this.$el.find('#c-channels-browser'),
                client: this.client,
                channels: this.client.channels
            });


            /* Sidebar */
            //channels tabs
            this.tabs = new w.Chattie.TabsView({
                el: this.$el.find('#c-channels-list'),
                channels: this.client.channels,
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