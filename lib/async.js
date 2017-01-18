"use strict";
var yaku_1 = require("./yaku");
var tryErr = {
    err: null
};
function tryCatch(step, key) {
    try {
        return step(key);
    }
    catch (err) {
        tryErr.err = err;
        return tryErr;
    }
}
exports.__esModule = true;
exports["default"] = function (generator) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var gen = generator.apply(this, args);
    function genNext(val) {
        return step("next", val);
    }
    function genThrow(val) {
        return step("throw", val);
    }
    function step(key, val) {
        var info = gen[key](val);
        if (info.done) {
            return yaku_1["default"].resolve(info.value);
        }
        else {
            return yaku_1["default"].resolve(info.value).then(genNext, genThrow);
        }
    }
    var ret = tryCatch(step, "next");
    if (ret === tryErr)
        return yaku_1["default"].reject(ret.err);
    else
        return ret;
}; };
