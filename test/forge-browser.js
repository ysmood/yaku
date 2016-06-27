var k;
global.window = {};
for (k in global) {
    window[k] = global[k];
}

window.process = null;
window.Symbol = null;
var Yaku = require("../src/yaku");
var yakuThrow = require("../src/throw");

var testSuit = require("./testSuit");

module.exports = testSuit("long stack trace", function (it) {

    Yaku.enableLongStackTrace();

    return it("basic", "ok", function () {
        return Yaku.resolve().then(function () {
            return "ok";
        });
    }).then(function () {
        return it("long stack trace with constructor", "err", function () {
            return new Yaku(function (r, rr) {
                rr(new Error("err"));
            }).catch(function (err) {
                return err.message;
            });
        });
    }).then(function () {
        return it("uncaught rejection", true, function () {
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
    });

});