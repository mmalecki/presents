(function (exports) {
  var Presents = exports.Presents = function (options) {
    options = options || {};

    var match = window.location.hash.match(/^#slide-(\d+)$/);
    this.currentSlide = match ? parseInt(match[1], 10) : 0;

    this.parentContainer = options.parentContainer;
    if (this.parentContainer) this.runHelpers();

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

  Presents.prototype.runHelpers = function () {
    var children = this.parentContainer.children;
    Array.prototype.slice.call(children).forEach(function (child, i) {
      if (!child.id) child.id = 'slide-' + i
    })
  };
})(window);

