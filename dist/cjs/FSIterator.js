"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "default", {
    enumerable: true,
    get: function() {
        return FSIterator;
    }
});
var _fs = /*#__PURE__*/ _interop_require_default(require("fs"));
var _path = /*#__PURE__*/ _interop_require_default(require("path"));
var _stackbaseiterator = /*#__PURE__*/ _interop_require_default(require("stack-base-iterator"));
var _PathStack = /*#__PURE__*/ _interop_require_default(require("./PathStack.js"));
var _fifoRemove = /*#__PURE__*/ _interop_require_default(require("./fifoRemove.js"));
var _index = /*#__PURE__*/ _interop_require_default(require("./fs-compat/index.js"));
var _lifoFromArray = /*#__PURE__*/ _interop_require_default(require("./lifoFromArray.js"));
function _assert_this_initialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
function _call_super(_this, derived, args) {
    derived = _get_prototype_of(derived);
    return _possible_constructor_return(_this, _is_native_reflect_construct() ? Reflect.construct(derived, args || [], _get_prototype_of(_this).constructor) : derived.apply(_this, args));
}
function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _get_prototype_of(o) {
    _get_prototype_of = Object.setPrototypeOf ? Object.getPrototypeOf : function getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _get_prototype_of(o);
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _set_prototype_of(subClass, superClass);
}
function _interop_require_default(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function _possible_constructor_return(self, call) {
    if (call && (_type_of(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assert_this_initialized(self);
}
function _set_prototype_of(o, p) {
    _set_prototype_of = Object.setPrototypeOf || function setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _set_prototype_of(o, p);
}
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
function _is_native_reflect_construct() {
    try {
        var result = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function() {}));
    } catch (_) {}
    return (_is_native_reflect_construct = function() {
        return !!result;
    })();
}
var FSIterator = /*#__PURE__*/ function(StackBaseIterator) {
    "use strict";
    _inherits(FSIterator, StackBaseIterator);
    function FSIterator(root, options) {
        _class_call_check(this, FSIterator);
        var _this;
        var setup = function setup() {
            cancelled = true;
        };
        _this = _call_super(this, FSIterator, [
            options
        ]);
        options = options || {};
        if (_this.options.depth === undefined) _this.options.depth = Infinity;
        _this.options.readdir = {
            encoding: 'utf8',
            withFileTypes: _fs.default.Dirent && !options.alwaysStat
        };
        _this.options.stat = {
            bigint: process.platform === 'win32' || /^(msys|cygwin)$/.test(process.env.OSTYPE)
        };
        _this.options.error = options.error || function defaultError(err) {
            return ~FSIterator.EXPECTED_ERRORS.indexOf(err.code); // skip known issues
        };
        _this.root = _path.default.resolve(root);
        _this.stack = new _PathStack.default();
        var cancelled = false;
        _this.processing.push(setup);
        _index.default.readdir(_this.root, _this.options.readdir, function(err, files) {
            (0, _fifoRemove.default)(_this.processing, setup);
            if (_this.done || cancelled) return;
            if (err) return _this.end(err);
            if (files.length) _this.push({
                path: null,
                depth: 0,
                files: (0, _lifoFromArray.default)(files)
            });
        });
        return _this;
    }
    return FSIterator;
}(_stackbaseiterator.default);
FSIterator.EXPECTED_ERRORS = [
    'ENOENT',
    'EPERM',
    'EACCES',
    'ELOOP'
];
/* CJS INTEROP */ if (exports.__esModule && exports.default) { try { Object.defineProperty(exports.default, '__esModule', { value: true }); for (var key in exports) { exports.default[key] = exports[key]; } } catch (_) {}; module.exports = exports.default; }