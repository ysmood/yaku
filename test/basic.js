
var Yaku = require("../src/yaku");
var utils = require("../src/utils");
var testSuit = require("./testSuit");

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
            throw "Please use a newer js runtime that supports Symbol";
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
            throw "Please use a newer js runtime that supports Symbol";
        else
            Symbol = global.Symbol;

        arr[Symbol.iterator] = function () {
            return [1, 2, 3][Symbol.iterator]();
        };

        return Yaku.race(arr);
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

    it("async array", [0, null, void 0, 1, 2, 3], function () {
        var list;
        list = [
            0,
            null,
            void 0,
            utils.sleep(20, 1),
            utils.sleep(10, 2),
            utils.sleep(10, 3)
        ];
        return utils.async(2, list);
    });

    it("async error", $val, function () {
        var iter = {
            i: 0,
            next: function () {
                var fn = [
                    function () {
                        return utils.sleep(10, 1);
                    }, function () {
                        throw $val;
                    }, function () {
                        return utils.sleep(10, 3);
                    }
                ][iter.i++];

                return { done: !fn, value: fn && fn() };
            }
        };
        return utils.async(2, iter)["catch"](function (err) {
            return err;
        });
    });

    it("async iter progress", 10, function () {
        var iter = { i: 0, next: function () {
            var done = iter.i++ >= 10;
            return {
                done: done,
                value: !done && new Yaku(function (r) {
                    return setTimeout((function () {
                        return r(1);
                    }), 1);
                })
            };
        } };

        var count = 0;
        return utils.async(3, iter, false, function (ret) {
            return count += ret;
        }).then(function () {
            return count;
        });
    });

    it("flow array", "bc", function () {
        return (utils.flow([
            "a", Yaku.resolve("b"), function (v) {
                return v + "c";
            }
        ]))(0);
    });

    it("flow error", $val, function () {
        return (utils.flow([
            "a", Yaku.resolve("b"), function () {
                throw $val;
            }
        ]))(0)["catch"](function (err) {
            return err;
        });
    });

    it("flow iter", [0, 1, 2, 3], function () {
        var list;
        list = [];
        return utils.flow({ next: function (v) {
            return {
                done: v === 3,
                value: v !== 3 && Yaku.resolve().then(function () {
                    list.push(v);
                    return ++v;
                })
            };
        } })(0).then(function (v) {
            list.push(v);
            return list;
        });
    });

    it("promisify promise with this", "OK0", function () {
        var obj = {
            val: "OK",
            foo: function (val, cb) {
                return setTimeout(function (val) {
                    return cb(null, val);
                }, 0, this.val + val);
            }
        };
        return utils.promisify(obj.foo, obj)(0);
    });

    it("promisify promise", 1, function () {
        var fn;
        fn = utils.promisify(function (val, cb) {
            return setTimeout(function () {
                return cb(null, val + 1);
            });
        });
        return fn(0);
    });

    it("promisify promise 2", 3, function () {
        var fn;
        fn = utils.promisify(function (a, b, cb) {
            return setTimeout(function () {
                return cb(null, a + b);
            });
        });
        return fn(1, 2);
    });

    it("promisify promise err", "err", function () {
        var fn;
        fn = utils.promisify(function (a, cb) {
            return setTimeout(function () {
                return cb(a);
            });
        });
        return fn("err").catch(function (v) { return v });
    });

    it("promisify callback", 1, function () {
        var fn;
        fn = utils.promisify(function (val, cb) {
            return setTimeout(function () {
                return cb(null, val + 1);
            });
        });
        return new Yaku(function (r) {
            return fn(0, function (err, val) {
                return r(val);
            });
        });
    });

    it("callbackify callback", "ok", function () {
        var fn = utils.callbackify(function (v) {
            return Yaku.resolve(v);
        });
        return new Yaku(function (resolve, reject) {
            fn("ok", function (err, val) {
                if (err) reject(err);

                resolve(val);
            });
        });
    });

    it("callbackify callback only", "ok", function () {
        var fn = utils.callbackify(function () {
            return Yaku.resolve("ok");
        });
        return new Yaku(function (resolve, reject) {
            fn(function (err, val) {
                if (err) reject(err);

                resolve(val);
            });
        });
    });

    it("Observable", "out: 9", function () {
        var one, three, tmr, two, x;
        one = new utils.Observable();
        x = 1;

        tmr = setInterval(function () {
            return one.emit(x++);
        }, 0);

        two = one.subscribe(function (v) {
            return v * v;
        });

        three = two.subscribe(function (v) {
            return "out: " + v;
        });

        return new Yaku(function (r) {
            var count;
            count = 0;
            return three.subscribe(function (v) {
                if (count++ === 2) {
                    clearInterval(tmr);
                    return r(v);
                }
            });
        });
    });

    it("Observable error", "error", function () {
        var one, three, tmr, two, x;
        one = new utils.Observable();
        x = 1;
        tmr = setInterval(function () {
            one.emit(x++);
            if (x === 2) {
                return one.emit(Yaku.reject("error"));
            }
        }, 0);

        two = one.subscribe(function (v) {
            return v * v;
        });

        three = two.subscribe(function (v) {
            return "out: " + v;
        });

        return new Yaku(function (r) {
            return three.subscribe((function () {}), function (err) {
                clearInterval(tmr);
                return r(err);
            });
        });
    });

    it("Observable subscribers", "ok", function () {
        var one, tmr;
        tmr = null;
        one = new utils.Observable(function (emit) {
            return tmr = setInterval(function () {
                return emit("err");
            }, 0);
        });
        return new Yaku(function (r) {
            setTimeout(function () {
                clearInterval(tmr);
                return r("ok");
            }, 10);
            one.subscribe(function (v) {
                return r(v);
            });
            return one.subscribers = [];
        });
    });

    it("Observable unsubscribe null publisher", null, function () {
        var o = new utils.Observable();
        o.unsubscribe();
        return o.publisher;
    });

    it("Observable unsubscribe", "ok", function () {
        return new Yaku(function (r) {
            var one = new utils.Observable(function (emit) {
                setTimeout(emit, 1);
            });

            var two = one.subscribe(function () {
                r("err");
            });

            setTimeout(function () {
                return r("ok");
            }, 10);

            two.unsubscribe();
        });
    });

    it("Observable merge", ["one", "two"], function () {
        return new Yaku(function (r) {
            var flag = false;

            var one = new utils.Observable(function (emit) { setTimeout(emit, 0, "one"); });
            var two = new utils.Observable(function (emit) {
                setTimeout(function () {
                    flag = true;
                    emit("two");
                }, 0);
            });

            var three = utils.Observable.merge([one, two]);
            var out = [];
            three.subscribe(function (v) {
                out.push(v);

                if (flag) r(out);
            });
        });
    });

    it("Observable merge error", 0, function () {
        var src = new utils.Observable(function (emit) {
            setTimeout(emit, 10, 0);
        });

        var a = src.subscribe(function (v) { return Yaku.reject(v); });
        var b = src.subscribe(function (v) { return Yaku.reject(v + 1); });

        var out = utils.Observable.merge([a, b]);

        return new Yaku(function (r, rr) {
            out.subscribe(rr, r);
        });
    });

    it("retry once", "ok", function () {
        var fn;
        fn = function (val) {
            return val;
        };
        return utils.retry(3, fn)("ok");
    });

    it("retry 2 times", "ok", function () {
        var count, fn;
        count = 0;
        fn = function (v) {
            if (count < 2) {
                throw "err" + count++;
            } else {
                return v;
            }
        };
        return utils.retry(5, fn)("ok");
    });

    it("retry 3 times", ["err0", "err1", "err2"], function () {
        var count, fn;
        count = 0;
        fn = function () {
            throw "err" + count++;
        };
        return utils.retry(3, fn)()["catch"](function (errs) {
            return errs;
        });
    });

    it("guard basic", "err", function () {
        return Yaku.reject(new TypeError("err"))
        .then(function () {
            return Yaku.reject();
        })
        .guard(TypeError, function (err) {
            return err.message;
        });
    });

    it("guard catch general error", "err", function () {
        return Yaku.reject(new TypeError("err"))
        .then(function () {
            return Yaku.reject();
        })
        .guard(Error, function (err) {
            return err.message;
        });
    });

    it("if true", "true", function () {
        return utils.if(utils.sleep(100, true), function () {
            return "true";
        }, function () {
            return "false";
        });
    });

    it("if false", "false", function () {
        return utils.if(false, function () {
            return "true";
        }, function () {
            return "false";
        });
    });

    it("if only true", "true", function () {
        return utils.if(utils.sleep(100, true), function () {
            return "true";
        });
    });

});