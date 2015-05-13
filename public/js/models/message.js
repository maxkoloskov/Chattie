(function (w) {
    w.Chattie = w.Chattie || {};

    w.Chattie.MessageModel = Backbone.Model.extend();

    w.Chattie.MessagesCollection = Backbone.Collection.extend({
        model: w.Chattie.MessageModel
    });

}) (window);