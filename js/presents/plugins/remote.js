(function (exports) {
  var Remote = exports.Remote = {};

  Remote.attach = function (options) {
    var self = this;

    var ws = new WebSocket(options.url);
    ws.onmessage = function (e) {
      var data = JSON.parse(e.data);
      if (data.next) {
        self.next();
      }
      else if (data.previous) {
        self.previous();
      }
      else if (data.goTo) {
        self.goTo(parseInt(data.goTo, 10));
      }
    };
  };
})(window);
