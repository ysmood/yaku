"use strict";
var _1 = require("./_");
var yaku_1 = require("./yaku");
exports.__esModule = true;
exports["default"] = function (cond, trueFn, falseFn) {
    return yaku_1["default"].resolve(cond).then(function (val) { return val ?
        trueFn() :
        (_1["default"].isFunction(falseFn) && falseFn()); });
};
