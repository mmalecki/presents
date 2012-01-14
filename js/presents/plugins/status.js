(function (exports) {
  var Status = exports.Status = {};

  Status.attach = function (options) {
    var self = this;

    self.on('slide::*', function () {
      var e = document.getElementById('presents-status');
      if (e) {
        e.innerHTML = self.currentSlide;
      }
    });
  };
})(window);

