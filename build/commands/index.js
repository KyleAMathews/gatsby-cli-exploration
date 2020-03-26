// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"index.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireWildcard(require("react"));

var _ink = require("ink");

var _react2 = require("@xstate/react");

var _xstate = require("xstate");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const open = require("open");

const toggleMachine = (0, _xstate.Machine)({
  id: "cli",
  initial: "idle",
  on: {
    RETURN_TO_IDLE: `idle`
  },
  states: {
    idle: {
      id: "idle",
      states: {},
      on: {
        KEYPRESS_o: `OpeningLink`,
        r: "#Restart"
      }
    },
    OpeningLink: {
      states: {},
      on: {
        KEYPRESS_s: {
          target: `idle`,
          actions: `openLink`
        }
      }
    },
    Restart: {
      id: "Restart",
      states: {},
      on: {
        no: "#idle",
        yes: "#Restarting"
      }
    },
    Restarting: {
      id: "Restarting",
      states: {}
    }
  },
  actions: {
    openLink: (context, event) => {
      open(`http://localhost:8001`);
    }
  }
});

const useKeyHandler = keyHandler => {
  const {
    stdin,
    setRawMode
  } = (0, _react.useContext)(_ink.StdinContext);
  (0, _react.useEffect)(() => {
    setRawMode(true);
    stdin.on("data", keyHandler);
    return () => {
      stdin.off("data", keyHandler);
      setRawMode(false);
    };
  }, [stdin, setRawMode]);
};

const useTerminalResize = () => {
  const {
    stdout
  } = (0, _react.useContext)(_ink.StdoutContext);
  const [sizes, setSizes] = (0, _react.useState)([stdout.columns, stdout.rows]);
  (0, _react.useEffect)(() => {
    stdout.on("resize", () => {
      setSizes([stdout.columns, stdout.rows]);
    });
    return () => {
      stdout.off("resize");
    };
  }, [stdout]);
  return sizes;
}; // Ideas
// state machine — press command and ask for confirmation at bottom
// shortcuts — "o" then "s" to open site. "o" then "g" to open graphql, etc.
// could highlight links when click o for example


const Header = ({
  children
}) => _react.default.createElement(_ink.Box, null, _react.default.createElement(_ink.Color, {
  bgBlue: true,
  black: true
}, children));

const Error = ({
  children
}) => _react.default.createElement(_ink.Color, {
  bgRed: true,
  black: true
}, children);

const Warning = ({
  children
}) => _react.default.createElement(_ink.Color, {
  bgYellow: true,
  black: true
}, children);

const CLI = props => {
  const [current, send, service] = (0, _react2.useMachine)(toggleMachine); // Run any actions

  current.actions.forEach(action => {
    if (action.type === `openLink`) {
      open(`http://localhost:8001`);
    } // service.actions[action.type](current.context, current.event)

  });
  const [lastKey, setKey] = (0, _react.useState)(``);
  useKeyHandler(keypress => {
    // Work around xstate's lack of catch all
    if (current.value === `OpeningLink` && keypress !== `s`) {
      send(`RETURN_TO_IDLE`);
    } else {
      send(`KEYPRESS_${keypress}`);
    }

    setKey(keypress);
  });
  const [width, height] = useTerminalResize();
  return _react.default.createElement(_ink.Box, {
    flexDirection: "column",
    marginTop: 1
  }, _react.default.createElement(_ink.Box, {
    flexDirection: "row",
    justifyContent: "space-between"
  }, _react.default.createElement(_ink.Box, {
    flex: 2,
    flexDirection: "column"
  }, _react.default.createElement(Error, null, "errors"), _react.default.createElement(Warning, null, "warnings"), _react.default.createElement(_ink.Box, {
    flex: 1
  }, "width: ", width, ", height: ", height), _react.default.createElement(_ink.Box, null, "Last key (", lastKey, ")"), _react.default.createElement(_ink.Box, null, "Toggle: ", JSON.stringify(current.value, null, 4))), _react.default.createElement(_ink.Box, {
    flex: 1,
    flexDirection: "column"
  }, _react.default.createElement(Header, null, "Links"), _react.default.createElement(_ink.Box, null, "https://localhost:8000"), _react.default.createElement(_ink.Box, null, "https://localhost:8000/___graphql"), _react.default.createElement(_ink.Box, null, ` `), _react.default.createElement(Header, null, "Commands"), _react.default.createElement(_ink.Box, null, "[r] restart \"gatsby develop\" process"), _react.default.createElement(_ink.Box, null, "[o] open links"), _react.default.createElement(_ink.Box, null, "[s] shadow theme components"))), _react.default.createElement(_ink.Box, null, ` `), _react.default.createElement(_ink.Box, null, ` `), _react.default.createElement(_ink.Box, {
    textWrap: `truncate`
  }, "—".repeat(width)), _react.default.createElement(_ink.Box, {
    height: 1,
    flexDirection: "row"
  }, _react.default.createElement(_ink.Color, {
    bgGreen: true,
    black: true
  }, "RESTART NEEDED [r]"), ` | `, _react.default.createElement(Error, null, "1 error"), ` | `, _react.default.createElement(Warning, null, "2 warnings"), ` | `, _react.default.createElement(_ink.Color, null, "117 pages"), _react.default.createElement(_ink.Box, {
    flexGrow: 1
  }), _react.default.createElement(_ink.Color, null, "Kyle's cool blog")));
};

var _default = CLI;
exports.default = _default;
},{}]},{},["index.js"], null)
//# sourceMappingURL=/index.js.map