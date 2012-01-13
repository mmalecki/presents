(function (exports) {
  var Controls = exports.Controls = {};

  Controls.attach = function (options) {
    var self = this;

    document.addEventListener('keypress', function (e) {
      var c = String.fromCharCode(e.keyCode);
      if (c == "h" || c == "k") {
        self.previous();
      }
      else if (c == "l" || c == "j") {
        self.next();
      }
    });
  };
})(window);

