(function (exports) {
  var Controls = exports.Controls = {},
      pageNumber = null;

  Controls.attach = function (options) {
    var self = this;

    document.addEventListener('keypress', function (e) {
      var c = String.fromCharCode(e.keyCode);
      if (pageNumber !== null) {
        if (c === '\r') {
          self.goTo(+pageNumber);
          pageNumber = null;
        }
        else {
          pageNumber += c;
        }
      }
      else if (c === "h" || c === "k") {
        self.previous();
      }
      else if (c === "l" || c === "j") {
        self.next();
      }
      else if (c === ':') {
        pageNumber = '';
      }
    });
  };
})(window);

