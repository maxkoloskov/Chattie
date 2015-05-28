(function(w, $, _) {

    w.Chattie = w.Chattie || {};

    w.Chattie.TabsView = Backbone.View.extend({
        focus: true,
        initialize: function (options) {
            this.client = options.client;
            this.template = Handlebars.compile($('#template-dialog-tab').html());
            this.dialogs = options.dialogs;

            this.dialogs.on('change:joined', function (dialog, joined) {
                if (joined) {
                    this.add(dialog.toJSON());
                    return;
                }
                this.remove(dialog.id);
            }, this);

            this.dialogs.on('change:displayName change:description', this.update, this);

            this.dialogs.current.on('change:id', function (current, id) {
                this.switch(id);
                this.clearAlerts(id);
            }, this);


            this.dialogs.on('messages:new', this.alert, this);

            this.switch(this.dialogs.current.get('id'));

            $(w).on('focus blur', _.bind(this.onFocusBlur, this));
            this.render();
        },

        add: function(dialog) {
            this.$el.append(this.template(dialog));
        },

        remove: function(id) {
            this.$el.find('.c-dialog-tab[data-id=' + id + ']').remove();
        },

        update: function(dialog) {
            this.$el.find('.c-dialog-tab[data-id=' + dialog.id + '] .c-dialog-tab-title').text(dialog.get('displayName'));
        },

        switch: function(id) {
            if (!id) {
                return;
            }
            this.$el.find('.c-dialog-tab').removeClass('active')
                .filter('[data-id=' + id + ']').addClass('active');
        },

        alert: function(message) {
            var $tab = this.$('.c-dialog-tab[data-id=' + message.dialog.id + ']'),
                $alerts = $tab.find('.c-dialog-tab-alerts');

            if (message.historical || $tab.length === 0 || ((this.dialogs.current.get('id') === message.dialog.id) && this.focus)) {
                return;
            }

            var alertsCnt = parseInt($tab.data('alerts-count')) || 0;

            $tab.data('alerts-count', ++alertsCnt);
            $alerts.text(alertsCnt).css('display', 'block');
        },

        clearAlerts: function(id) {
            var $tab = this.$('.c-dialog-tab[data-id=' + id + ']'),
                $alerts = $tab.find('.c-dialog-tab-alerts');


            $alerts.text('').css('display', 'none');
            $tab.data('alerts-count', 0);
        },

        onFocusBlur: function(e) {
            var self = this;
            this.focus = (e.type === 'focus');
            clearTimeout(this.clearTimer);
            if (this.focus) {
                this.clearTimer = setTimeout(function () {
                    self.clearAlerts(self.dialogs.current.get('id'));
                }, 1000);
                return;
            }
            self.clearAlerts(self.dialogs.current.get('id'));
        }
    });

}) (window, $, _);