var Promise = require("../src/yaku");

var root = typeof global === "object" ? global : window;

module.exports = function (it) {

    var process = root.process;
    var $val = { val: "OK" };

    if (process) { return [
        it("unhandled rejection", $val, function () {
            return new Promise(function (r) {
                function handler (reason) {
                    return r(reason);
                }
                process.once("unhandledRejection", handler);
                return Promise.resolve().then(function () {
                    return Promise.reject($val);
                });
            });
        }),

        it("no unhandled rejection", $val, function () {
            return new Promise(function (resolve, reject) {
                function handler () {
                    process.removeListener("unhandledRejection", handler);
                    return reject();
                }
                process.once("unhandledRejection", handler);

                return Promise.reject()["catch"](function () {
                    return setTimeout(function () {
                        return resolve($val);
                    }, 100);
                });
            });
        }),

        it("unhandled rejection inside a catch", $val, function () {
            return new Promise(function (r) {
                function handler (reason) {
                    return r(reason);
                }
                process.once("unhandledRejection", handler);

                return Promise.reject()["catch"](function () {
                    return Promise.reject($val);
                });
            });
        }),

        it("unhandled rejection only once", 1, function () {
            var count = 0;
            function handler () {
                return count++;
            }

            process.on("unhandledRejection", handler);

            Promise.reject().then(function () {
                return $val;
            });

            return new Promise(function (r) {
                return setTimeout(function () {
                    process.removeListener("unhandledRejection", handler);
                    return r(count);
                }, 50);
            });
        }),

        it("long stack trace", 2, function () {
            Promise.enableLongStackTrace();
            return Promise.resolve().then(function () {
                throw new Error("abc");
            })["catch"](function (err) {
                console.log(err);
                return err.stack.match(/From previous event:/g).length;
            });
        })
    ]; }

};
