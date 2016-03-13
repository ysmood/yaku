import "../typings/node.d.ts";
import getPromise from "../test/getPromise";
import utils from "../src/utils";
import testSuit from "./testSuit";

let Promise = getPromise(process.env.shim);
let setPrototypeOf = require("setprototypeof");
let Symbol = global.Symbol || {};

let $val = {
    val: "ok"
};

export default testSuit("basic", function (it) {

    it("resolve order", ["DEHAFGBC", "DEHAFGBC"], function () {
        return new Promise(function (assertResolve) {
            let assertRes = [];
            let result = "";
            let resolve, resolve2;

            let p = new Promise(function (r) {
                resolve = r;
            });

            resolve({
                then: function () {
                    result += "A";
                    throw Error();
                }
            });

            p.catch(function () {
                result += "B";
            });
            p.catch(function () {
                result += "C";
                assertRes.push(result);
            });

            let p2 = new Promise(function (r) {
                resolve2 = r;
            });
            resolve2(Object.defineProperty({}, "then", {
                get: function () {
                    result += "D";
                    throw Error();
                }
            }));
            result += "E";
            p2.catch(function () {
                result += "F";
            });
            p2.catch(function () {
                result += "G";
            });
            result += "H";
            setTimeout(function () {
                if (~result.indexOf("C")) {
                    assertRes.push(result);
                }

                assertResolve(assertRes);
            }, 100);
        });
    });

    it("resolve", $val, function () {
        return new Promise(function (resolve) {
            return resolve($val);
        });
    });

    it("resolve promise like value", $val, function () {
        return new Promise(function (resolve) {
            return resolve({
                then: function (fulfil) {
                    return fulfil($val);
                }
            });
        });
    });

    it("constructor throw", $val, function () {
        return new Promise(function () {
            throw $val;
        })["catch"](function (e) {
            return e;
        });
    });

    it("resolve static", $val, function () {
        return Promise.resolve($val);
    });

    it("resolve promise", $val, function () {
        return Promise.resolve(Promise.resolve($val));
    });

    it("reject", $val, function () {
        return Promise.reject($val)["catch"](function (val) {
            return val;
        });
    });

    it("catch", $val, function () {
        return new Promise(function (nil, reject) {
            return reject($val);
        })["catch"](function (val) {
            return val;
        });
    });

    it("chain", "ok", function () {
        return Promise.resolve().then(function () {
            return new Promise(function (r) {
                return setTimeout(function () {
                    return r("ok");
                }, 10);
            });
        });
    });

    it("all with empty", [], function () {
        return Promise.all([]);
    });

    it("all with null", true, function () {
        return Promise.all(null).catch(function (err) {
            return err instanceof TypeError;
        });
    });

    it("all with array like", true, function () {
        return Promise.all({
            "0": 1, "1": 2, "2": 3, length: 3
        }).catch(function (err) {
            return err instanceof TypeError;
        });
    });

    it("all", [1, "test", "x", 10, 0], function () {
        function randomPromise (i) {
            return new Promise(function (r) {
                return setTimeout(function () {
                    return r(i);
                }, Math.random() * 10);
            });
        }

        return Promise.all([
            randomPromise(1), randomPromise("test"), Promise.resolve("x"), new Promise(function (r) {
                return setTimeout(function () {
                    return r(10);
                }, 1);
            }), new Promise(function (r) {
                return r(0);
            })
        ]);
    });

    it("all with custom Symbol.iterator", [1, 2, 3], function () {
        let arr = [];

        if (!Symbol.iterator)
            // skip the test
            return [1, 2, 3];

        arr[Symbol.iterator] = function () {
            return (<any>[1, 2, 3][Symbol.iterator])();
        };

        return Promise.all(arr);
    });

    it("all with iterator like", [1, 2, 3], function () {
        let arr = {
            list: [3, 2, 1],
            next: function () {
                return {
                    done: !this.list.length,
                    value: this.list.pop()
                };
            }
        };
        arr[Symbol.iterator] = function () { return this; };

        return Promise.all(arr);
    });

    it("all with iterator like, iteration error", "error", function () {
        let arr = {
            next: function () {
                throw "error";
            }
        };
        arr[Symbol.iterator] = function () { return this; };

        return Promise.all(arr).catch(function (err) {
            return err;
        });
    });

    it("all with iterator like, resolve error", "clean", function () {
        function SubPromise (it) {
            let self = new Promise(it);
            setPrototypeOf(self, SubPromise.prototype);
            return self;
        }

        setPrototypeOf(SubPromise, Promise);
        SubPromise.prototype = Object.create(Promise.prototype);
        SubPromise.prototype.constructor = SubPromise;

        return new Promise(function (resolve) {
            let arr = {
                count: 2,
                "return": function () {
                    resolve("clean");
                },
                next: function () {
                    return {
                        done: !--this.count
                    };
                }
            };
            arr[Symbol.iterator] = function () { return this; };

            SubPromise["resolve"] = function () { throw "err"; };

            SubPromise["all"](arr).catch(function () {});
        });
    });

    it("race with empty should never resolve", "ok", function () {
        return new Promise(function (resolve) {
            Promise.race([]).then(function () {
                resolve("err");
            });

            utils.sleep(30).then(function () {
                resolve("ok");
            });
        });
    });

    it("race with null", true, function () {
        return Promise.race(null).catch(function (err) {
            return err instanceof TypeError;
        });
    });

    it("race", 0, function () {
        return Promise.race([
            new Promise(function (r) {
                return setTimeout(function () {
                    return r(1);
                }, 10);
            }),
            new Promise(function (r) {
                return setTimeout(function () {
                    return r(0);
                });
            })
        ]);
    });

    it("race with custom Symbol.iterator", 1, function () {
        let arr = [];

        if (!Symbol.iterator)
            // skip the test
            return 1;

        arr[Symbol.iterator] = function () {
            return (<any>[1, 2, 3][Symbol.iterator])();
        };

        return Promise.race(arr);
    });

    it("race with iterator like", 1, function () {
        let arr = {
            list: [3, 2, 1],
            next: function () {
                return {
                    done: !this.list.length,
                    value: this.list.pop()
                };
            }
        };
        arr[Symbol.iterator] = function () { return this; };

        return Promise.race(arr);
    });

    it("race with iterator like, iteration error", "error", function () {
        let arr = {
            next: function () {
                throw "error";
            }
        };
        arr[Symbol.iterator] = function () { return this; };

        return Promise.race(arr).catch(function (err) {
            return err;
        });
    });

    it("race with iterator like, resolve error", "clean", function () {
        function SubPromise (it) {
            let self;
            self = new Promise(it);
            setPrototypeOf(self, SubPromise.prototype);
            return self;
        }

        setPrototypeOf(SubPromise, Promise);
        SubPromise.prototype = Object.create(Promise.prototype);
        SubPromise.prototype.constructor = SubPromise;

        return new Promise(function (resolve) {
            let arr = {
                count: 2,
                "return": function () {
                    resolve("clean");
                },
                next: function () {
                    return {
                        done: !--this.count
                    };
                }
            };
            arr[Symbol.iterator] = function () { return this; };

            SubPromise["resolve"] = function () { throw "err"; };

            SubPromise["race"](arr).catch(function () {});
        });
    });

    it("subclass", ["subclass", "subclass", "subclass", "subclass", "subclass", true, true, 5, 6], function () {
        function SubPromise (it) {
            let self;
            self = new Promise(it);
            setPrototypeOf(self, SubPromise.prototype);
            self.mine = "subclass";
            return self;
        }

        let result = [];

        setPrototypeOf(SubPromise, Promise);
        SubPromise.prototype = Object.create(Promise.prototype);
        SubPromise.prototype.constructor = SubPromise;

        let p1 = SubPromise["resolve"](5);
        result.push(p1.mine);
        p1 = p1.then(function (it) {
            return result.push(it);
        });
        result.push(p1.mine);

        let p2 = new (<any>SubPromise)(function (it) {
            return it(6);
        });
        result.push(p2.mine);
        p2 = p2.then(function (it) {
            return result.push(it);
        });
        result.push(p2.mine);

        let p3 = SubPromise["all"]([p1, p2]);
        result.push(p3.mine);
        result.push(p3 instanceof Promise);
        result.push(p3 instanceof SubPromise);

        return p3.then(utils.sleep(50), function (it) {
            return result.push(it);
        }).then(function () {
            return result;
        });
    });

    it("any one resolved", 0, function () {
        return utils.any([
            Promise.reject(1),
            Promise.resolve(0)
        ]);
    });

    it("any all rejected", [0, 1], function () {
        return utils.any([
            Promise.reject(0),
            Promise.reject(1)
        ]).catch(function (v) {
            return v;
        });
    });

});