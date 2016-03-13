
import Yaku from "../src/yaku";
import utils from "../src/utils";
import testSuit from "./testSuit";

let $val = {
    val: "ok"
};

export default testSuit("basic", function (it) {

    it("async array", [0, null, void 0, 1, 2, 3], function () {
        let list;
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
        let iter = {
            i: 0,
            next: function () {
                let fn = [
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
        return utils.async(2, <any>iter)["catch"](function (err) {
            return err;
        });
    });

    it("async iter progress", 10, function () {
        let iter = { i: 0, next: function () {
            let done = iter.i++ >= 10;
            return {
                done: done,
                value: !done && new Yaku(function (r) {
                    return setTimeout((function () {
                        return r(1);
                    }), 1);
                })
            };
        } };

        let count = 0;
        return utils.async(3, <any>iter, false, function (ret) {
            return count += +ret;
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
        let list;
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
        let obj = {
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
        let fn;
        fn = utils.promisify(function (val, cb) {
            return setTimeout(function () {
                return cb(null, val + 1);
            });
        });
        return fn(0);
    });

    it("promisify promise 2", 3, function () {
        let fn;
        fn = utils.promisify(function (a, b, cb) {
            return setTimeout(function () {
                return cb(null, a + b);
            });
        });
        return fn(1, 2);
    });

    it("promisify promise err", "err", function () {
        let fn;
        fn = utils.promisify(function (a, cb) {
            return setTimeout(function () {
                return cb(a);
            });
        });
        return fn("err").catch(function (v) { return v; });
    });

    it("promisify callback", 1, function () {
        let fn;
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
        let fn = utils.callbackify(function (v) {
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
        let fn = utils.callbackify(function () {
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
        let one, three, tmr, two, x;
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
            let count;
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
        let one, three, tmr, two, x;
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
        let one, tmr;
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
        let o = new utils.Observable();
        o.unsubscribe();
        return o.publisher;
    });

    it("Observable unsubscribe", "ok", function () {
        return new Yaku(function (r) {
            let one = new utils.Observable(function (emit) {
                setTimeout(emit, 1);
            });

            let two = one.subscribe(function () {
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
            let flag = false;

            let one = new utils.Observable(function (emit) { setTimeout(emit, 0, "one"); });
            let two = new utils.Observable(function (emit) {
                setTimeout(function () {
                    flag = true;
                    emit("two");
                }, 0);
            });

            let three = utils.Observable.merge([one, two]);
            let out = [];
            three.subscribe(function (v) {
                out.push(v);

                if (flag) r(out);
            });
        });
    });

    it("Observable merge error", 0, function () {
        let src = new utils.Observable(function (emit) {
            setTimeout(emit, 10, 0);
        });

        let a = src.subscribe(function (v) { return Yaku.reject(v); });
        let b = src.subscribe(function (v) { return Yaku.reject(v + 1); });

        let out = utils.Observable.merge([a, b]);

        return new Yaku(function (r, rr) {
            out.subscribe(rr, r);
        });
    });

    it("retry once", "ok", function () {
        let fn;
        fn = function (val) {
            return val;
        };
        return utils.retry(3, fn)("ok");
    });

    it("retry 2 times", "ok", function () {
        let count, fn;
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
        let count, fn;
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