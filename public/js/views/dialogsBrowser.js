(function(w, $, _) {
    w.Chattie = w.Chattie || {};

    w.Chattie.DialogsBrowserView = Backbone.View.extend({
        initialize: function(options) {
            this.client = options.client;
            this.dialogs = options.client.dialogs;
            this.dialogTemplate = Handlebars.compile($('#template-dialog').html());

            this.dialogsViews = {}; // {'id' : 'dialogView'}

            this.dialogs.on('change:joined', function(dialog, joined) {
                if (joined) {
                    this.add(dialog);
                    return;
                }
                this.remove(dialog.id);
            }, this);

            this.dialogs.current.on('change:id', function(current, id) {
                this.switch(id);
            }, this);

            this.switch(this.dialogs.current.get('id'));
        },

        hide: function() {
            this.$el.find('#c-dialogs').hide();
            this.$el.find('#c-background').show();
        },

        show: function() {
            this.$el.find('#c-background').hide();
            this.$el.find('#c-dialogs').show();
        },

        add: function(dialog) {
            if (this.dialogsViews[dialog.id]) {
                return;
            }

            this.dialogsViews[dialog.id] = new w.Chattie.DialogView({
                client: this.client,
                template: this.dialogTemplate,
                model: dialog
            });

            this.$el.find('#c-dialogs').append(this.dialogsViews[dialog.id].$el);
        },

        remove: function(id) {
            if (!this.dialogsViews[id]) {
                return;
            }

            this.dialogsViews[id].remove();
            delete this.dialogsViews[id];
        },

        switch: function(id) {

            if (!id || id === 'bg') {
                this.hide();
                return;
            }

            var $dialog = this.$el.find('.c-dialog[data-id=' + id + ']');
            $dialog.show().siblings().hide();
            $dialog.find('[autofocus]').focus();
            this.show();
            this.dialogsViews[id] && this.dialogsViews[id].scrollMessages();
        }

    });


}) (window, $, _);