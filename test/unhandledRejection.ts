/// <reference path="../typings/node.d.ts" />

import Promise from "../src/yaku";
import testSuit from "./testSuit";


let root = typeof global === "object" ? global : window;

export default testSuit("unhandledRejection", function (it) {

    let process = root.process;
    let $val = { val: "OK" };

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
                    process.once("unhandledRejection", reject);

                    return Promise.reject()["catch"](function () {
                        return setTimeout(function () {
                            return resolve($val);
                        }, 20);
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

            return it("rejection handled", true, function () {
                return new Promise(function (resolve) {
                    let promise;
                    process.once("unhandledRejection", function handler (reason, p) {
                        p.catch(function () {});
                    });
                    process.once("rejectionHandled", function (p) {
                        resolve(p === promise);
                    });
                    promise = Promise.reject();
                });
            });

        }).then(function () {

            return it("unhandled rejection only once", "ok", function () {
                return new Promise(function (r) {
                    process.once("unhandledRejection", function () {
                        r("ok");
                    });
                    Promise.reject().then(function () {
                        return $val;
                    });
                });
            });

        }).then(function () {

            return it("long stack trace", 2, function () {
                Promise.enableLongStackTrace();
                return Promise.resolve().then(function () {
                    throw new Error("abc");
                })["catch"](function (err) {
                    return err.stack.match(/From previous/g).length;
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

            return it("unhandled rejection inside a catch", $val, function (after) {
                after(function () {
                    root.onunhandledrejection = null;
                });

                return new Promise(function (r) {
                    function handler (e) {
                        return r(e.reason);
                    }
                    root.onunhandledrejection = handler;

                    return Promise.reject()["catch"](function () {
                        return Promise.reject($val);
                    });
                });
            });

        }).then(function () {

            return it("rejection handled", true, function (after) {
                after(function () {
                    root.onunhandledrejection = root.onrejectionhandled = null;
                });

                return new Promise(function (resolve) {
                    let promise;
                    root.onunhandledrejection = function (e) {
                        e.promise.catch(function () {});
                    };
                    root.onrejectionhandled = function (e) {
                        resolve(e.promise === promise && e.reason === $val);
                    };
                    promise = Promise.reject($val);
                });
            });

        }).then(function () {

            return it("unhandled rejection only once", 1, function (after) {
                after(function () {
                    root.onunhandledrejection = null;
                });

                let count = 0;
                function handler () {
                    return count++;
                }

                root.onunhandledrejection = handler;

                Promise.reject().then(function () {
                    return $val;
                });

                return new Promise(function (r) {
                    return setTimeout(function () {
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
                    return err.stack.match(/From previous/g).length;
                });
            });

        });
    }

});
