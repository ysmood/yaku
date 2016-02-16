var Yaku = require("../src/yaku");
var utils = require("../src/utils");
var testSuit = require("./testSuit");
var setPrototypeOf = require("setprototypeof");

var $val = {
    val: "ok"
};

module.exports = testSuit("basic", function (it) {

    it("resolve order", ["DEHAFGBC", "DEHAFGBC"], function () {
        return new Yaku(function (assertResolve) {
            var assertRes = [];
            var result = "";
            var resolve, resolve2;

            var p = new Yaku(function (r) {
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

            var p2 = new Yaku(function (r) {
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
        return new Yaku(function (resolve) {
            return resolve($val);
        });
    });

    it("resolve promise like value", $val, function () {
        return new Yaku(function (resolve) {
            return resolve({
                then: function (fulfil) {
                    return fulfil($val);
                }
            });
        });
    });

    it("constructor throw", $val, function () {
        return new Yaku(function () {
            throw $val;
        })["catch"](function (e) {
            return e;
        });
    });

    it("resolve static", $val, function () {
        return Yaku.resolve($val);
    });

    it("resolve promise", $val, function () {
        return Yaku.resolve(Yaku.resolve($val));
    });

    it("reject", $val, function () {
        return Yaku.reject($val)["catch"](function (val) {
            return val;
        });
    });

    it("catch", $val, function () {
        return new Yaku(function (nil, reject) {
            return reject($val);
        })["catch"](function (val) {
            return val;
        });
    });

    it("chain", "ok", function () {
        return Yaku.resolve().then(function () {
            return new Yaku(function (r) {
                return setTimeout(function () {
                    return r("ok");
                }, 10);
            });
        });
    });

    it("empty all", [], function () {
        return Yaku.all([]);
    });

    it("array like", [1, 2, 3], function () {
        return Yaku.all({
            "0": 1, "1": 2, "2": 3, length: 3
        });
    });

    it("all", [1, "test", "x", 10, 0], function () {
        function randomPromise (i) {
            return new Yaku(function (r) {
                return setTimeout(function () {
                    return r(i);
                }, Math.random() * 10);
            });
        }

        return Yaku.all([
            randomPromise(1), randomPromise("test"), Yaku.resolve("x"), new Yaku(function (r) {
                return setTimeout(function () {
                    return r(10);
                }, 1);
            }), new Yaku(function (r) {
                return r(0);
            })
        ]);
    });

    it("all with custom Symbol.iterator", [1, 2, 3], function () {
        var arr = [], Symbol;

        if (!global.Symbol)
            // skip the test
            return [1, 2, 3];
        else
            Symbol = global.Symbol;

        arr[Symbol.iterator] = function () {
            return [1, 2, 3][Symbol.iterator]();
        };

        return Yaku.all(arr);
    });

    it("race", 0, function () {
        return Yaku.race([
            new Yaku(function (r) {
                return setTimeout(function () {
                    return r(1);
                }, 10);
            }),
            new Yaku(function (r) {
                return setTimeout(function () {
                    return r(0);
                });
            })
        ]);
    });

    it("race with custom Symbol.iterator", 1, function () {
        var arr = [], Symbol;

        if (!global.Symbol)
            // skip the test
            return 1;
        else
            Symbol = global.Symbol;

        arr[Symbol.iterator] = function () {
            return [1, 2, 3][Symbol.iterator]();
        };

        return Yaku.race(arr);
    });

    it("subclass", ["subclass", "subclass", "subclass", "subclass", "subclass", true, true, 5, 6], function () {
        function SubPromise (it) {
            var self;
            self = new Yaku(it);
            setPrototypeOf(self, SubPromise.prototype);
            self.mine = "subclass";
            return self;
        }

        var result = [];

        setPrototypeOf(SubPromise, Yaku);
        SubPromise.prototype = Object.create(Yaku.prototype);
        SubPromise.prototype.constructor = SubPromise;

        var p1 = SubPromise.resolve(5);
        result.push(p1.mine);
        p1 = p1.then(function (it) {
            return result.push(it);
        });
        result.push(p1.mine);

        var p2 = new SubPromise(function (it) {
            return it(6);
        });
        result.push(p2.mine);
        p2 = p2.then(function (it) {
            return result.push(it);
        });
        result.push(p2.mine);

        var p3 = SubPromise.all([p1, p2]);
        result.push(p3.mine);
        result.push(p3 instanceof Yaku);
        result.push(p3 instanceof SubPromise);

        return p3.then(utils.sleep(50), function (it) {
            return result.push(it);
        }).then(function () {
            return result;
        });
    });

    it("any one resolved", 0, function () {
        return utils.any([
            Yaku.reject(1),
            Yaku.resolve(0)
        ]);
    });

    it("any all rejected", [0, 1], function () {
        return utils.any([
            Yaku.reject(0),
            Yaku.reject(1)
        ]).catch(function (v) {
            return v;
        });
    });

});