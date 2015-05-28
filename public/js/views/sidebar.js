(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.SidebarView = Backbone.View.extend({
        events: {
            'submit .c-dialog-create': 'createDialog'
        },
        initialize: function(options) {
            this.client = options.client;
            this.dialogs = options.dialogs;

            /* SUBVIEWS */
            //dialogs tabs
            this.tabs = new w.Chattie.TabsView({
                el: this.$el.find('#c-dialogs-list'),
                dialogs: this.client.dialogs,
                client: this.client
            });

            // online/offline
            this.status = new w.Chattie.ConnectionIndicatorsView({
                el: this.$el.find('#c-connection-indicators'),
                client: this.client
            });

            return this;
        },

        createDialog: function(e) {
            e.preventDefault();
            var $modal = this.$('#c-add-dialog-modal');
            var $form = this.$(e.target);

            var options = {
                name: $form.find('.c-dialog-name-input').val().trim(),
                displayName: $form.find('.c-dialog-displayname-input').val().trim(),
                description: $form.find('.c-dialog-description-input').val().trim(),
                // TODO: 2 колбека: success и failed
                callback: function() {
                    $modal.modal('hide');
                    $form.trigger('reset');
                    $form.find('.form-group, .input-group');
                }
            };

            if (!options.displayName) {
                $form.find('.c-dialog-displayname-input').parent().addClass('has-error');
                return;
            }

            if (!options.name) {
                $form.find('.c-dialog-name-input').parent().addClass('has-error');
                return;
            }

            this.client.events.trigger('dialogs:create', options);
        }
    });
})(window, $, _);