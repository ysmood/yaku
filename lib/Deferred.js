"use strict";
var yaku_1 = require("./yaku");
exports.__esModule = true;
exports["default"] = function () {
    var defer;
    defer = {};
    defer.promise = new yaku_1["default"](function (resolve, reject) {
        defer.resolve = resolve;
        return defer.reject = reject;
    });
    return defer;
};
