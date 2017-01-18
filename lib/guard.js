"use strict";
var yaku_1 = require("./yaku");
yaku_1["default"].prototype['guard'] = function (type, onRejected) {
    return this["catch"](function (reason) {
        if (reason instanceof type && onRejected)
            return onRejected(reason);
        else
            return yaku_1["default"].reject(reason);
    });
};
