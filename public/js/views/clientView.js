(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.ClientView = Backbone.View.extend({
        el: '#c-client-ui',
        initialize: function(options) {
            this.client = options.client;

            /* SUBVIEWS */

            /* DialogsBrowser */
            this.dialogsBrowser = new w.Chattie.DialogsBrowserView({
                el: this.$el.find('#c-dialogs-browser'),
                client: this.client,
                dialogs: this.client.dialogs
            });

            /* Sidebar */
            this.sidebar = new w.Chattie.SidebarView({
                el: this.$el.find('#c-sidebar'),
                client: this.client,
                dialogs: this.dialogs
            });

            ////dialogs tabs
            //this.tabs = new w.Chattie.TabsView({
            //    el: this.$el.find('#c-dialogs-list'),
            //    dialogs: this.client.dialogs,
            //    client: this.client
            //});
            //
            //// online/offline
            //this.status = new w.Chattie.ConnectionIndicatorsView({
            //    el: this.$el.find('#c-connection-indicators'),
            //    client: this.client
            //});

            return this;
        }
    });
})(window, $, _);