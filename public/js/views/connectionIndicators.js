(function (w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.ConnectionIndicatorsView = Backbone.View.extend({
        initialize: function(options) {
            var self = this;
            this.client = options.client;
            this.client.status.on('change:connected', function(status, connected) {
                self.$el.find('[data-status="online"]').toggle(connected);
                self.$el.find('[data-status="offline"]').toggle(!connected);
            });
        }
    });

}) (window, $, _);