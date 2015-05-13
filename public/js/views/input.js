(function(w, $, _) {

    w.Chattie = w.Chattie || {};

    w.Chattie.InputView = Backbone.View.extend({
        events: {
            'keypress #c-msg-input': 'keyPress'
        },
        initialize: function (options) {
            this.client = options.client;
        },

        keyPress: function(e) {

            //if (e.altKey || e.ctrlKey) return;

            var keys = {
                ENTER_KEY: 13,
                ESC_KEY: 27
            };

            var $textarea = this.$('#c-msg-input');

            switch(e.keyCode) {
                case keys.ENTER_KEY: // send message
                    e.preventDefault();
                    if (!this.client.status.get('connected')) return;
                    if (!this.client.channels.current.get('id')) return;
                    if (!$textarea.val().trim()) return;
                    this.client.events.trigger('messages:send', {
                        channel: this.client.channels.current.get('id'),
                        text: $textarea.val().trim()
                    });
                    $textarea.val('');
                    break;
                case keys.ESC_KEY:
                    e.preventDefault();
                    $textarea.val('').blur();
                    console.log('esc');
                    break;
                default:
                    return;
            }
        }

    });

})(window, $, _);