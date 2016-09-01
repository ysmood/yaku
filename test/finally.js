
var Yaku = require("../src/yaku");
var testSuit = require("./testSuit");

module.exports = testSuit("basic", function (it) {
    it("finally no arguments", undefined, function () {
        return new Yaku(function (resolve) {
            Yaku.resolve("ok").finally(function (val) {
                resolve(val);
            });
        });
    });

    it("finally throw error", "error", function () {
        return Yaku.resolve("ok").finally(function () {
            throw "error";
        }).catch(function (e) {
            return e;
        });
    });

    it("finally resolve", "ok", function () {
        return Yaku.resolve("ok").finally(function () {
        });
    });

    it("finally reject", "error", function () {
        return Yaku.reject("error").finally(function () {
        });
    });
});