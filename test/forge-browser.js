window = Object.assign({}, global);
window.process = null;
window.Symbol = null;
var Yaku = require("../src/yaku");

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
        return it("uncaught rejection", "err", function () {
            return new Yaku(function (r) {
                window.onunhandledrejection = function (err) {
                    r(err.reason.message);
                };

                Yaku.reject(new Error("err"));
            });
        });
    });

});