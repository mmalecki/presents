(function (exports) {
  var Presents = exports.Presents = function (options) {
    this.currentSlide = 0;

    App.call(this, options);
  };
  inherits(Presents, App);

  Presents.prototype.goTo = function (slide) {
    var id = "slide-" + slide;
    if (document.getElementById(id)) {
      window.location.hash = id;
      this.currentSlide = slide;
      this.emit('slide::' + id);
    }
  };

  Presents.prototype.next = function () {
    this.goTo(this.currentSlide + 1);
  };

  Presents.prototype.previous = function () {
    this.goTo(this.currentSlide - 1);
  };
})(window);

