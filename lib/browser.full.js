// This file is intended for browser only.
"use strict";
var yaku_1 = require("./yaku");
var utils_1 = require("./utils");
for (var key in utils_1["default"]) {
    yaku_1["default"][key] = utils_1["default"][key];
}
window['Yaku'] = yaku_1["default"];
exports.__esModule = true;
exports["default"] = yaku_1["default"];
