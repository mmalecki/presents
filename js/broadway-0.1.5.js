

//
// Generated on Fri Dec 23 2011 12:07:49 GMT+0530 (IST) by Nodejitsu, Inc (Using Codesurgeon).
// Version 0.1.5
//

(function (exports) {


;!function(exports, undefined) {

  var isArray = Array.isArray;
  var defaultMaxListeners = 10;

  function init() {
    this._events = new Object;
  }

  function configure(conf) {

    if (conf) {
      this.wildcard = conf.wildcard;
      this.delimiter = conf.delimiter || '.';

      if (this.wildcard) {
        this.listenerTree = new Object;
      }
    }
  }

  function EventEmitter(conf) {
    this._events = new Object;
    configure.call(this, conf);
  }

  function searchListenerTree(handlers, type, tree, i) {
    if (!tree) {
      return;
    }

    var listeners;

    if (i === type.length && tree._listeners) {
      //
      // If at the end of the event(s) list and the tree has listeners
      // invoke those listeners.
      //
      if (typeof tree._listeners === 'function') {
        handlers && handlers.push(tree._listeners);
        return tree;
      } else {
        for (var leaf = 0, len = tree._listeners.length; leaf < len; leaf++) {
          handlers && handlers.push(tree._listeners[leaf]);
        }
        return tree;
      }
    }

    if (type[i] === '*' || tree[type[i]]) {
      //
      // If the event emitted is '*' at this part
      // or there is a concrete match at this patch
      //
      if (type[i] === '*') {
        for (var branch in tree) {
          if (branch !== '_listeners' && tree.hasOwnProperty(branch)) {
            listeners = searchListenerTree(handlers, type, tree[branch], i+1);
          }
        }
        return listeners;
      }

      listeners = searchListenerTree(handlers, type, tree[type[i]], i+1);
    }


    if (tree['*']) {
      //
      // If the listener tree will allow any match for this part,
      // then recursively explore all branches of the tree
      //
      searchListenerTree(handlers, type, tree['*'], i+1);
    }

    return listeners;
  };

  function growListenerTree(type, listener) {

    type = typeof type === 'string' ? type.split(this.delimiter) : type.slice();

    var tree = this.listenerTree;
    var name = type.shift();

    while (name) {

      if (!tree[name]) {
        tree[name] = new Object;
      }

      tree = tree[name];

      if (type.length === 0) {

        if (!tree._listeners) {
          tree._listeners = listener;
        }
        else if(typeof tree._listeners === 'function') {
          tree._listeners = [tree._listeners, listener];
        }
        else if (isArray(tree._listeners)) {

          tree._listeners.push(listener);

          if (!tree._listeners.warned) {

            var m = defaultMaxListeners;

            if (m > 0 && tree._listeners.length > m) {

              tree._listeners.warned = true;
              console.error('(node) warning: possible EventEmitter memory ' +
                            'leak detected. %d listeners added. ' +
                            'Use emitter.setMaxListeners() to increase limit.',
                            tree._listeners.length);
              console.trace();
            }
          }
        }
        return true;
      }
      name = type.shift();
    }
    return true;
  };

  // By default EventEmitters will print a warning if more than
  // 10 listeners are added to it. This is a useful default which
  // helps finding memory leaks.
  //
  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.

  EventEmitter.prototype.setMaxListeners = function(n) {
    this._events || init.call(this);
    this._events.maxListeners = n;
  };

  EventEmitter.prototype.event = '';

  EventEmitter.prototype.once = function(event, fn) {
    this.many(event, 1, fn);
    return this;
  };

  EventEmitter.prototype.many = function(event, ttl, fn) {
    var self = this;

    if (typeof fn !== 'function') {
      throw new Error('many only accepts instances of Function');
    }

    function listener() {
      if (--ttl === 0) {
        self.off(event, listener);
      }
      fn.apply(null, arguments);
    };

    listener._origin = fn;

    this.on(event, listener);

    return self;
  };

  EventEmitter.prototype.emit = function() {
    this._events || init.call(this);

    var type = arguments[0];

    if (type === 'newListener') {
      if (!this._events.newListener) { return false; }
    }

    // Loop through the *_all* functions and invoke them.
    if (this._all) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
      for (i = 0, l = this._all.length; i < l; i++) {
        this.event = type;
        this._all[i].apply(this, args);
      }
    }

    // If there is no 'error' event listener then throw.
    if (type === 'error') {
      
      if (!this._all && 
        !this._events.error && 
        !(this.wildcard && this.listenerTree.error)) {

        if (arguments[1] instanceof Error) {
          throw arguments[1]; // Unhandled 'error' event
        } else {
          throw new Error("Uncaught, unspecified 'error' event.");
        }
        return false;
      }
    }

    var handler;

    if(this.wildcard) {
      handler = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handler, ns, this.listenerTree, 0);
    }
    else {
      handler = this._events[type];
    }

    if (typeof handler === 'function') {
      this.event = type;
      if (arguments.length === 1) {
        handler.call(this);
      }
      else if (arguments.length > 1)
        switch (arguments.length) {
          case 2:
            handler.call(this, arguments[1]);
            break;
          case 3:
            handler.call(this, arguments[1], arguments[2]);
            break;
          // slower
          default:
            var l = arguments.length;
            var args = new Array(l - 1);
            for (var i = 1; i < l; i++) args[i - 1] = arguments[i];
            handler.apply(this, args);
        }
      return true;
    }
    else if (handler) {
      var l = arguments.length;
      var args = new Array(l - 1);
      for (var i = 1; i < l; i++) args[i - 1] = arguments[i];

      var listeners = handler.slice();
      for (var i = 0, l = listeners.length; i < l; i++) {
        this.event = type;
        listeners[i].apply(this, args);
      }
      return true;
    }

  };

  EventEmitter.prototype.on = function(type, listener) {
    this._events || init.call(this);

    // To avoid recursion in the case that type == "newListeners"! Before
    // adding it to the listeners, first emit "newListeners".
    this.emit('newListener', type, listener);

    if(this.wildcard) {
      growListenerTree.call(this, type, listener);
      return this;
    }

    if (!this._events[type]) {
      // Optimize the case of one listener. Don't need the extra array object.
      this._events[type] = listener;
    }
    else if(typeof this._events[type] === 'function') {
      // Adding the second element, need to change to array.
      this._events[type] = [this._events[type], listener];
    }
    else if (isArray(this._events[type])) {
      // If we've already got an array, just append.
      this._events[type].push(listener);

      // Check for listener leak
      if (!this._events[type].warned) {

        var m;
        if (this._events.maxListeners !== undefined) {
          m = this._events.maxListeners;
        } else {
          m = defaultMaxListeners;
        }

        if (m && m > 0 && this._events[type].length > m) {

          this._events[type].warned = true;
          console.error('(node) warning: possible EventEmitter memory ' +
                        'leak detected. %d listeners added. ' +
                        'Use emitter.setMaxListeners() to increase limit.',
                        this._events[type].length);
          console.trace();
        }
      }
    }
    return this;
  };

  EventEmitter.prototype.onAny = function(fn) {

    if(!this._all) {
      this._all = [];
    }

    if (typeof fn !== 'function') {
      throw new Error('onAny only accepts instances of Function');
    }

    // Add the function to the event listener collection.
    this._all.push(fn);
    return this;
  };

  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  EventEmitter.prototype.off = function(type, listener) {
    if (typeof listener !== 'function') {
      throw new Error('removeListener only takes instances of Function');
    }

    var handlers;

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leaf = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      if('undefined' === typeof leaf) { return this; }
      handlers = leaf._listeners;
    }
    else {
      // does not use listeners(), so no side effect of creating _events[type]
      if (!this._events[type]) return this;
      handlers = this._events[type];
    }

    if (isArray(handlers)) {

      var position = -1;

      for (var i = 0, length = handlers.length; i < length; i++) {
        if (handlers[i] === listener ||
          (handlers[i].listener && handlers[i].listener === listener) ||
          (handlers[i]._origin && handlers[i]._origin === listener)) {
          position = i;
          break;
        }
      }

      if (position < 0) {
        return this;
      }

      if(this.wildcard) {
        leaf._listeners.splice(position, 1)
      }
      else {
        this._events[type].splice(position, 1);
      }

      if (handlers.length === 0) {
        if(this.wildcard) {
          delete leaf._listeners;
        }
        else {
          delete this._events[type];
        }
      }
    }
    else if (handlers === listener ||
      (handlers.listener && handlers.listener === listener) ||
      (handlers._origin && handlers._origin === listener)) {
      if(this.wildcard) {
        delete leaf._listeners;
      }
      else {
        delete this._events[type];
      }
    }

    return this;
  };

  EventEmitter.prototype.offAny = function(fn) {
    var i = 0, l = 0, fns;
    if (fn && this._all && this._all.length > 0) {
      fns = this._all;
      for(i = 0, l = fns.length; i < l; i++) {
        if(fn === fns[i]) {
          fns.splice(i, 1);
          return this;
        }
      }
    } else {
      this._all = [];
    }
    return this;
  };

  EventEmitter.prototype.removeListener = EventEmitter.prototype.off;

  EventEmitter.prototype.removeAllListeners = function(type) {
    if (arguments.length === 0) {
      !this._events || init.call(this);
      return this;
    }

    if(this.wildcard) {
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      var leaf = searchListenerTree.call(this, null, ns, this.listenerTree, 0);

      if('undefined' === typeof leaf) { return this; }
      leaf._listeners = null;
    }
    else {
      if (!this._events[type]) return this;
      this._events[type] = null;
    }
    return this;
  };

  EventEmitter.prototype.listeners = function(type) {
    if(this.wildcard) {
      var handlers = [];
      var ns = typeof type === 'string' ? type.split(this.delimiter) : type.slice();
      searchListenerTree.call(this, handlers, ns, this.listenerTree, 0);
      return handlers;
    }

    this._events || init.call(this);

    if (!this._events[type]) this._events[type] = [];
    if (!isArray(this._events[type])) {
      this._events[type] = [this._events[type]];
    }
    return this._events[type];
  };

  EventEmitter.prototype.listenersAny = function() {

    if(this._all) {
      return this._all;
    }
    else {
      return [];
    }

  };

  exports.EventEmitter2 = EventEmitter;

}(typeof exports === 'undefined' ? window : exports);

/*
 * browser.js: Browser specific functionality for broadway.
 *
 * (C) 2011, Nodejitsu Inc.
 * MIT LICENSE
 *
 */

var common = {
  mixin: function (target) {
    var objs = Array.prototype.slice.call(arguments, 1);
    objs.forEach(function (o) {
      Object.keys(o).forEach(function (attr) {
        var getter = o.__lookupGetter__(attr);
        if (!getter) {
          target[attr] = o[attr];
        }
        else {
          target.__defineGetter__(attr, getter);
        }
      });
    });

    return target;
  }
};

var App = exports.App = function (options) {
  //
  // Setup options and `App` constants.
  //
  var self       = this;
  options        = options || {};
  this.root      = options.root;
  this.delimiter = options.delimiter || '::';

  //
  // Inherit from `EventEmitter2`
  //
  exports.EventEmitter2.call(this, {
    delimiter: this.delimiter,
    wildcard: true
  });

  //
  // Setup other relevant options such as the plugins
  // for this instance.
  //
  this.options      = options;
  this.plugins      = options.plugins || {};
  this.initialized  = false;
  this.bootstrapper = { init: function (app, func) {} };
  this.initializers = {};
};

var inherit = function (ctor, superCtor) {
  ctor.super_ = superCtor;
  ctor.prototype = Object.create(superCtor.prototype, {
    constructor: {
      value: ctor,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
}

inherit(exports.App, exports.EventEmitter2);

App.prototype.init = function(options, callback) {
    if (!callback && typeof options === "function") {
        callback = options;
        options = {};
    }
    if (this.initialized) {
        return callback();
    }
    var self = this;
    options = options || {};
    callback = callback || function() {};
    this.env = options.env || this.env;
    this.options = common.mixin({}, this.options, options);
    function onComplete() {
        self.initialized = true;
        self.emit("init");
        callback();
    }
    function ensureFeatures(err) {
        return err ? onError(err) : features.ensure(this, onComplete);
    }
    function initPlugin(plugin, next) {
        if (typeof self.initializers[plugin] === "function") {
            return self.initializers[plugin].call(self, function(err) {
                if (err) {
                    return next(err);
                }
                self.emit([ "plugin", plugin, "init" ]);
                self.initializers[plugin] = true;
                next();
            });
        }
        next();
    }
    function initPlugins() {
        async.forEach(Object.keys(self.initializers), initPlugin, ensureFeatures);
    }
    function onError(err) {
        self.emit([ "error", "init" ], err);
        callback(err);
    }
    this.bootstrapper.init(this, initPlugins);
};

App.prototype.use = function(plugin, options, callback) {
    options = options || {};
    var name = plugin.name, self = this;
    if (name == null) name = plugin;
    if (this.plugins[name] && this.plugins[name].detach) {
        this.plugins[name].detach(this);
    }
    this.plugins[name] = plugin;
    this.options[name] = common.mixin({}, options, this.options[name] || {});
    if (this.plugins[name].attach && options.attach !== false) {
        this.plugins[name].attach.call(this, options);
    }
    if (options.init === false) {
        return;
    }
    if (!this.initialized) {
        this.initializers[name] = plugin.init || true;
    } else if (plugin.init) {
        plugin.init.call(this, function(err) {
            var args = err ? [ [ "plugin", name, "error" ], err ] : [ [ "plugin", name, "init" ] ];
            self.emit.apply(self, args);
            if (callback) {
                return err ? callback(err) : callback();
            }
        });
    }
};

App.prototype.remove = function(name) {
    if (name.name) {
        name = name.name;
    }
    if (this.plugins[name] && this.plugins[name].detach) {
        this.plugins[name].detach.call(this);
    }
    delete this.plugins[name];
    delete this.options[name];
    delete this.initializers[name];
};

App.prototype.inspect = function() {};



}(window));
