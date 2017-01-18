"use strict";
var yaku_1 = require("./yaku");
var genIterator_1 = require("./genIterator");
exports.__esModule = true;
exports["default"] = function (iterable) {
    var iter = genIterator_1["default"](iterable);
    return new yaku_1["default"](function (resolve, reject) {
        var countDown = 0;
        var reasons = [];
        var item;
        function onError(reason) {
            reasons.push(reason);
            if (!--countDown)
                reject(reasons);
        }
        while (!(item = iter.next()).done) {
            countDown++;
            yaku_1["default"].resolve(item.value).then(resolve, onError);
        }
    });
};
