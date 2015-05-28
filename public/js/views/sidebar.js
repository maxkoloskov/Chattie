(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.SidebarView = Backbone.View.extend({
        events: {
            'submit .c-channel-create': 'createChannel'
        },
        initialize: function(options) {
            this.client = options.client;
            this.channels = options.channels;

            /* SUBVIEWS */
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
        },

        createChannel: function(e) {
            e.preventDefault();
            var $modal = this.$('#c-add-channel-modal');
            var $form = this.$(e.target);

            var options = {
                name: $form.find('.c-channel-name-input').val().trim(),
                displayName: $form.find('.c-channel-displayname-input').val().trim(),
                description: $form.find('.c-channel-description-input').val().trim(),
                // TODO: 2 колбека: success и failed
                callback: function() {
                    $modal.modal('hide');
                    $form.trigger('reset');
                    $form.find('.form-group, .input-group');
                }
            };

            if (!options.displayName) {
                $form.find('.c-channel-displayname-input').parent().addClass('has-error');
                return;
            }

            if (!options.name) {
                $form.find('.c-channel-name-input').parent().addClass('has-error');
                return;
            }

            this.client.events.trigger('channels:create', options);
        }
    });
})(window, $, _);