"use strict";
var _1 = require("./_");
var genIterator_1 = require("./genIterator");
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
exports["default"] = function (limit, list) {
    if (!_1["default"].isNumber(limit)) {
        list = limit;
        limit = Infinity;
    }
    return new yaku_1["default"](function (resolve, reject) {
        var running = 0;
        var gen = genIterator_1["default"](list);
        var done = false;
        function genNext() {
            running--;
            return step("next");
        }
        function genThrow(reason) {
            running--;
            return reject(reason);
        }
        function step(key) {
            if (done) {
                if (running === 0)
                    resolve();
                return;
            }
            while (running < limit) {
                var info = gen[key]();
                if (info.done) {
                    if (running === 0)
                        resolve();
                    return done = true;
                }
                else {
                    running++;
                    yaku_1["default"].resolve(info.value).then(genNext, genThrow);
                }
            }
        }
        var ret = tryCatch(step, "next");
        if (ret === tryErr)
            reject(ret.err);
    });
};
