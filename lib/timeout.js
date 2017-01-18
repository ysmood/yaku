"use strict";
var yaku_1 = require("./yaku");
exports.__esModule = true;
exports["default"] = function (promise, time, error) {
    if (error === void 0)
        error = new Error("time out");
    return new yaku_1["default"](function (resolve, reject) {
        setTimeout(reject, time, error);
        yaku_1["default"].resolve(promise).then(resolve, reject);
    });
};
