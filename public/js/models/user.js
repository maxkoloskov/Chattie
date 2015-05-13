(function (w) {
    w.Chattie = w.Chattie || {};

    w.Chattie.UserModel = Backbone.Model.extend();

    w.Chattie.UsersCollection = Backbone.Collection.extend({
        model: w.Chattie.UserModel
    });

}) (window);