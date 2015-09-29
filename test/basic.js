
var Yaku = require("../src/yaku");
var utils = require("../src/utils");

var $val = {
    val: "ok"
};

module.exports = function (it) { return [

    it("resolve", $val, function () {
        return new Yaku(function (resolve) {
            return resolve($val);
        });
    }),

    it("resolve promise like value", $val, function () {
        return new Yaku(function (resolve) {
            return resolve({
                then: function (fulfil) {
                    return fulfil($val);
                }
            });
        });
    }),

    it("constructor abort", 111, function () {
        var p;
        p = new Yaku(function (resolve, reject) {
            var tmr;
            tmr = setTimeout(resolve, 100, "done");
            return this.abort = function () {
                clearTimeout(tmr);
                return reject(111);
            };
        });
        p.abort($val);
        return p["catch"](function (e) {
            return e;
        });
    }),

    it("constructor throw", $val, function () {
        return new Yaku(function () {
            throw $val;
        })["catch"](function (e) {
            return e;
        });
    }),

    it("resolve static", $val, function () {
        return Yaku.resolve($val);
    }),

    it("resolve promise", $val, function () {
        return Yaku.resolve(Yaku.resolve($val));
    }),

    it("reject", $val, function () {
        return Yaku.reject($val)["catch"](function (val) {
            return val;
        });
    }),

    it("catch", $val, function () {
        return new Yaku(function (nil, reject) {
            return reject($val);
        })["catch"](function (val) {
            return val;
        });
    }),

    it("chain", "ok", function () {
        return Yaku.resolve().then(function () {
            return new Yaku(function (r) {
                return setTimeout(function () {
                    return r("ok");
                }, 10);
            });
        });
    }),

    it("empty all", [], function () {
        return Yaku.all([]);
    }),

    it("all", [1, "test", "x", 10, 0], function () {
        function randomPromise (i) {
            return new Yaku(function (r) {
                return setTimeout(function () {
                    return r(i);
                }, Math.random() * 100);
            });
        }

        return Yaku.all([
            randomPromise(1), randomPromise("test"), Yaku.resolve("x"), new Yaku(function (r) {
                return setTimeout(function () {
                    return r(10);
                }, 10);
            }), new Yaku(function (r) {
                return r(0);
            })
        ]);
    }),

    it("race", 0, function () {
        return Yaku.race([
            new Yaku(function (r) {
                return setTimeout(function () {
                    return r(0);
                }, 20);
            }), new Yaku(function (r) {
                return setTimeout(function () {
                    return r(1);
                }, 30);
            })
        ]);
    }),

    it("any one resolved", 0, function () {
        return utils.any([
            Promise.reject(1),
            Promise.resolve(0)
        ]);
    }),

    it("any all rejected", [0, 1], function () {
        return utils.any([
            Promise.reject(0),
            Promise.reject(1)
        ]).catch(function (v) {
            return v;
        });
    }),

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
    }),

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
    }),

    it("async iter progress", 10, function () {
        var iter = { i: 0, next: function () {
            var done = iter.i++ >= 10;
            return {
                done: done,
                value: !done && new Yaku(function (r) {
                    return setTimeout((function () {
                        return r(1);
                    }), 10);
                })
            };
        } };

        var count = 0;
        return utils.async(3, iter, false, function (ret) {
            return count += ret;
        }).then(function () {
            return count;
        });
    }),

    it("flow array", "bc", function () {
        return (utils.flow([
            "a", Yaku.resolve("b"), function (v) {
                return v + "c";
            }
        ]))(0);
    }),

    it("flow error", $val, function () {
        return (utils.flow([
            "a", Yaku.resolve("b"), function () {
                throw $val;
            }
        ]))(0)["catch"](function (err) {
            return err;
        });
    }),

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
    }),

    it("promisify promise", 1, function () {
        var fn;
        fn = utils.promisify(function (val, cb) {
            return setTimeout(function () {
                return cb(null, val + 1);
            });
        });
        return fn(0);
    }),

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
    }),

    it("source", "out: 4", function () {
        var one, three, tmr, two, x;
        one = utils.source();
        x = 1;
        tmr = setInterval(function () {
            return one.emit(x++);
        }, 0);
        two = one(function (v) {
            return v * v;
        });
        three = two(function (v) {
            return "out: " + v;
        });
        return new Yaku(function (r) {
            var count;
            count = 0;
            return three(function (v) {
                if (count++ === 1) {
                    clearInterval(tmr);
                    return r(v);
                }
            });
        });
    }),

    it("source error", "error", function () {
        var one, three, tmr, two, x;
        one = utils.source();
        x = 1;
        tmr = setInterval(function () {
            one.emit(x++);
            if (x === 2) {
                return one.emit(Yaku.reject("error"));
            }
        }, 0);
        two = one(function (v) {
            return v * v;
        });
        three = two(function (v) {
            return "out: " + v;
        });
        return new Yaku(function (r) {
            return three((function () {}), function (err) {
                clearInterval(tmr);
                return r(err);
            });
        });
    }),

    it("source children", "ok", function () {
        var one, tmr;
        tmr = null;
        one = utils.source(function (emit) {
            return tmr = setInterval(function () {
                return emit("err");
            }, 0);
        });
        return new Yaku(function (r) {
            setTimeout(function () {
                clearInterval(tmr);
                return r("ok");
            }, 10);
            one(function (v) {
                return r(v);
            });
            return one.children = [];
        });
    }),

    it("retry once", "ok", function () {
        var fn;
        fn = function (val) {
            return val;
        };
        return utils.retry(3, fn)("ok");
    }),

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
    }),

    it("retry 3 times", ["err0", "err1", "err2"], function () {
        var count, fn;
        count = 0;
        fn = function () {
            throw "err" + count++;
        };
        return utils.retry(3, fn)()["catch"](function (errs) {
            return errs;
        });
    })

]; };