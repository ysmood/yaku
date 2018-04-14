/**
 * Test if Yaku works as expected on browser env.
 */

var k;
global.window = { Promise: Promise };
global.self = window;
for (k in global) {
    window[k] = global[k];
}

var nativePromise = global.Promise;
window.process = null;
window.Symbol = null;
var Yaku = require("../src/yaku");
var yakuThrow = require("../src/throw");
var sleep = require("../src/sleep");

var testSuit = require("./testSuit");

module.exports = testSuit("long stack trace", function (it) {

    Yaku.enableLongStackTrace();

    return it("basic", "ok", function () {
        return Yaku.resolve().then(function () {
            return "ok";
        });
    }).then(function () {
        return it("use window.Promise.then as nextTick", "ok", function () {
            window.Promise = nativePromise;
            return Yaku.resolve("ok");
        }).then(function () {
            window.Promise = null;
        });
    }).then(function () {
        return it("native Promise should be cache by yaku internally", "ok", function () {
            window.Promise = Yaku;
            return Yaku.resolve("ok");
        }).then(function () {
            window.Promise = null;
        });
    }).then(function () {
        return it("long stack trace with constructor", "err", function () {
            return new Yaku(function (r, rr) {
                rr(new Error("err"));
            })["catch"](function (err) {
                return err.message;
            });
        });
    }).then(function () {
        return it("default uncaught rejection", undefined, function () {
            Yaku.reject(new Error("err"));

            return sleep(10);
        });
    }).then(function () {
        return it("window uncaught rejection", true, function () {
            return new Yaku(function (r) {
                window.onunhandledrejection = function (err) {
                    r(
                        /Error: err/.test(err.reason.longStack) &&
                        /From previous Error/.test(err.reason.longStack)
                    );
                };

                Yaku.reject(new Error("err"));
            });
        });
    }).then(function () {
        return it("throw", "err", function () {
            return new Yaku(function (resolve) {
                var err = function () {
                    resolve("err");
                    process.removeListener("uncaughtException", err);
                };

                process.on("uncaughtException", err);
                yakuThrow("err");
            });
        });
    }).then(function () {
        return it("throw", "err", function () {
            return new Yaku(function (resolve) {
                var err = function () {
                    resolve("err");
                    process.removeListener("uncaughtException", err);
                };

                process.on("uncaughtException", err);
                yakuThrow(new Error("err"));
            });
        });
    });

});
