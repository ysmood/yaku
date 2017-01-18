"use strict";
var _1 = require("./_");
var genIterator_1 = require("./genIterator");
var isPromise_1 = require("./isPromise");
var yaku_1 = require("./yaku");
exports.__esModule = true;
exports["default"] = function (iterable) {
    var iter = genIterator_1["default"](iterable);
    return function (val) {
        function run(pre) {
            return pre.then(function (val) {
                var task = iter.next(val);
                if (task.done) {
                    return val;
                }
                var curr = task.value;
                return run(isPromise_1["default"](curr) ? curr :
                    _1["default"].isFunction(curr) ? yaku_1["default"].resolve(curr(val)) :
                        yaku_1["default"].resolve(curr));
            });
        }
        return run(yaku_1["default"].resolve(val));
    };
};
