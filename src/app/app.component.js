(function(app) {
  app.AppComponent =
    ng.core.Component({
      selector: 'my-app',
      template: '<h1>Hello Angular</h1>'
    })
    .Class({
      constructor: function() {}
    });
})(window.app || (window.app = {}));

