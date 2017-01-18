"use strict";
var yaku_1 = require("./yaku");
exports.__esModule = true;
exports["default"] = function (time, val) { return new yaku_1["default"](function (r) {
    setTimeout(r, time, val);
}); };
