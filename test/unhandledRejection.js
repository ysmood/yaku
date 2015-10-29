var Promise = require("../src/yaku");
var testSuit = require("./testSuit");


var root = typeof global === "object" ? global : window;

module.exports = testSuit("unhandledRejection", function (it) {

    var process = root.process;
    var $val = { val: "OK" };

    // Node or Browser
    if (process) {
        return Promise.resolve()
        .then(function () {

            return it("unhandled rejection", { reason: $val, promise: true }, function () {
                return new Promise(function (r) {
                    function handler (reason, promise) {
                        return r({ reason: reason, promise: typeof promise === "object" });
                    }
                    process.once("unhandledRejection", handler);
                    return Promise.resolve().then(function () {
                        return Promise.reject($val);
                    });
                });
            });

        }).then(function () {

            return it("no unhandled rejection", $val, function () {
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
            });

        }).then(function () {

            return it("unhandled rejection inside a catch", $val, function () {
                return new Promise(function (r) {
                    function handler (reason) {
                        return r(reason);
                    }
                    process.once("unhandledRejection", handler);

                    return Promise.reject()["catch"](function () {
                        return Promise.reject($val);
                    });
                });
            });

        }).then(function () {

            return it("unhandled rejection only once", 1, function () {
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
            });

        }).then(function () {

            return it("long stack trace", 2, function () {
                Promise.enableLongStackTrace();
                return Promise.resolve().then(function () {
                    throw new Error("abc");
                })["catch"](function (err) {
                    return err.stack.match(/From previous event:/g).length;
                });
            });

        });

    } else {
        return Promise.resolve()
        .then(function () {

            return it("unhandled rejection", { reason: $val, promise: true }, function () {
                return new Promise(function (r) {
                    function handler (e) {
                        root.onunhandledrejection = null;
                        return r({ reason: e.reason, promise: typeof e.promise === "object" });
                    }
                    root.onunhandledrejection = handler;
                    return Promise.resolve().then(function () {
                        return Promise.reject($val);
                    });
                });
            });

        }).then(function () {

            return it("no unhandled rejection", $val, function () {
                return new Promise(function (resolve, reject) {
                    function handler () {
                        root.onunhandledrejection = null;
                        return reject();
                    }
                    root.onunhandledrejection = handler;

                    return Promise.reject()["catch"](function () {
                        return setTimeout(function () {
                            return resolve($val);
                        }, 100);
                    });
                });
            });

        }).then(function () {

            return it("unhandled rejection inside a catch", $val, function () {
                return new Promise(function (r) {
                    function handler (e) {
                        root.onunhandledrejection = null;
                        return r(e.reason);
                    }
                    root.onunhandledrejection = handler;

                    return Promise.reject()["catch"](function () {
                        return Promise.reject($val);
                    });
                });
            });

        }).then(function () {

            return it("unhandled rejection only once", 1, function () {
                var count = 0;
                function handler () {
                    return count++;
                }

                root.onunhandledrejection = handler;

                Promise.reject().then(function () {
                    return $val;
                });

                return new Promise(function (r) {
                    return setTimeout(function () {
                        root.onunhandledrejection = null;
                        return r(count);
                    }, 50);
                });
            });

        }).then(function () {

            return it("long stack trace", 2, function () {
                Promise.enableLongStackTrace();
                return Promise.resolve().then(function () {
                    throw new Error("abc");
                })["catch"](function (err) {
                    return err.stack.match(/From previous event:/g).length;
                });
            });

        });
    }

});
