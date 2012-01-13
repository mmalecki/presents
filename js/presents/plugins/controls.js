(function (exports) {
  var Controls = exports.Controls = {};

  Controls.attach = function (options) {
    var self = this;

    document.addEventListener('keypress', function (e) {
      if (String.fromCharCode(e.keyCode) == "h") {
        self.previous();
      }
      else if (String.fromCharCode(e.keyCode) == "l") {
        self.next();
      }
    });
  };
})(window);

