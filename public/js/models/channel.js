(function (w) {
    w.Chattie = w.Chattie || {};

    w.Chattie.ChannelModel = Backbone.Model.extend({
        initialize: function() {
            this.messages = new w.Chattie.MessagesCollection();
            this.members = new w.Chattie.UsersCollection();
            this.lastMessage = new Backbone.Model();

            this.members.on('add', _.bind(function(members) {
                this.trigger('members:add', members, this);
            }, this));
            this.members.on('remove', function(members) {
                this.trigger('members:remove', members, this);
            }, this);
        },
        loaded: false
    });

    w.Chattie.ChannelsCollection = Backbone.Collection.extend({
        model: w.Chattie.ChannelModel,
        initialize: function() {
            this.current = new Backbone.Model();
            this.last = new Backbone.Model();
        }
    });

}) (window);