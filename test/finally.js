/**
 * Test for `Promise.finally`
 */

var getPromise = require("../test/getPromise");
var Promise = getPromise(process.env.shim);
var testSuit = require("./testSuit");

module.exports = testSuit("basic", function (it) {
    it("finally no arguments", undefined, function () {
        return new Promise(function (resolve) {
            Promise.resolve("ok")["finally"](function (val) {
                resolve(val);
            });
        });
    });

    it("finally throw error", "error", function () {
        return Promise.resolve("ok")["finally"](function () {
            throw "error";
        })["catch"](function (e) {
            return e;
        });
    });

    it("finally resolve", "ok", function () {
        return Promise.resolve("ok")["finally"](function () {
        });
    });

    it("finally reject", "error", function () {
        return Promise.reject("error")["finally"](function () {
        }).then(function () {
            throw "should not reach here";
        }, function (err) {
            return err;
        });
    });
});