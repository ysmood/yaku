"use strict";
var _1 = require("./_");
exports.__esModule = true;
exports["default"] = function (fn, self) { return function () {
    var args;
    var cb;
    var j;
    args = 2 <= arguments.length ?
        _1["default"].slice.call(arguments, 0, j = arguments.length - 1) :
        (j = 0, []), cb = arguments[j++];
    var isFn = _1["default"].isFunction(cb);
    if (!isFn) {
        args.push(cb);
        return fn.apply(self, args);
    }
    return fn.apply(self, args).then(function (val) {
        cb(null, val);
    })["catch"](cb);
}; };
