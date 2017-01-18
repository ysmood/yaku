"use strict";
exports.__esModule = true;
exports["default"] = {
    extendPrototype: function (src, target) {
        for (var k in target) {
            src.prototype[k] = target[k];
        }
        return src;
    },
    isFunction: function (obj) {
        return typeof obj === "function";
    },
    isNumber: function (obj) {
        return typeof obj === "number";
    },
    slice: [].slice
};
