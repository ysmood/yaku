"use strict";
var _1 = require("./_");
var sleep_1 = require("./sleep");
var yaku_1 = require("./yaku");
var $retryError = {};
exports.__esModule = true;
exports["default"] = function (initRetries, span, fn, self) { return function () {
    var retries = initRetries;
    var errs = [];
    var args = arguments;
    if (_1["default"].isFunction(span)) {
        self = fn;
        fn = span;
        span = 0;
    }
    var countdown = _1["default"].isFunction(retries) ?
        retries : function () { return sleep_1["default"](span, --retries); };
    function tryFn(isContinue) {
        return isContinue ? fn.apply(self, args) : yaku_1["default"].reject($retryError);
    }
    function onError(err) {
        if (err === $retryError)
            return yaku_1["default"].reject(errs);
        errs.push(err);
        return attempt(countdown(errs));
    }
    function attempt(c) {
        return yaku_1["default"].resolve(c).then(tryFn)["catch"](onError);
    }
    return attempt(true);
}; };
