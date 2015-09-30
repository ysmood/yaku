var $val, Yaku, assert, log, randomPromise, test, utils;

Yaku = require("../src/yaku");

utils = require("../src/utils");

log = (function () {
    return function (val) {
        var JSON, elem, xhr;
        if (typeof JSON === "undefined" || JSON === null) {
            JSON = {
                stringify: function (obj) {
                    return "\"" + obj + "\"";
                }
            };
        }
        if (typeof window !== "undefined" && window !== null) {
            xhr = new XMLHttpRequest();
            xhr.open("POST", "/log");
            xhr.send(val);
            elem = document.createElement("pre");
            elem.innerText = val;
            return document.body.appendChild(elem);
        } else {
            return console.log(val);
        }
    };
})();

assert = function (a, b) {
    var k, v;
    if (typeof a !== "object") {
        if (a === b) {
            return false;
        } else {
            return {
                a: a,
                b: b
            };
        }
    }
    for (k in a) {
        v = a[k];
        if (b[k] !== v) {
            return {
                a: a,
                b: b
            };
        }
    }
    return false;
};

test = function (name, shouldBe, fn) {
    var err, out, report;
    report = function (res) {
        if (!res) {
            return log("v [test] " + name);
        } else {
            log("x [test] " + name + "\n	>>>>>>>> Should Equal\n	" + (JSON.stringify(res.b)) + "\n	<<<<<<<< But Equal\n	" + (JSON.stringify(res.a)) + "\n	>>>>>>>>");
            return typeof process !== "undefined" && process !== null ? process.exit(1) : void 0;
        }
    };
    try {
        out = fn();
        if (out && out.then) {
            return out.then(function (v) {
                return report(assert(v, shouldBe));
            }, function (v) {
                return report(assert(v, shouldBe));
            });
        } else {
            return report(assert(fn(), shouldBe));
        }
    } catch (error) {
        err = error;
        return report({
            a: err && err.stack,
            b: shouldBe
        });
    }
};

$val = {
    val: "ok"
};

test("resolve", $val, function () {
    return new Yaku(function (resolve) {
        return resolve($val);
    });
});

test("resolve promise like value", $val, function () {
    return new Yaku(function (resolve) {
        return resolve({
            then: function (fulfil) {
                return fulfil($val);
            }
        });
    });
});

test("constructor abort", $val, function () {
    var p;
    p = new Yaku(function (resolve, reject) {
        var tmr;
        tmr = setTimeout(resolve, 100, "done");
        return this.abort = function (reason) {
            clearTimeout(tmr);
            return reject(reason);
        };
    });
    p.abort($val);
    return p["catch"](function (e) {
        return e;
    });
});

test("constructor throw", $val, function () {
    return new Yaku(function () {
        throw $val;
    })["catch"](function (e) {
        return e;
    });
});

test("resolve static", $val, function () {
    return Yaku.resolve($val);
});

test("resolve promise", $val, function () {
    return Yaku.resolve(Yaku.resolve($val));
});

test("reject", $val, function () {
    return Yaku.reject($val)["catch"](function (val) {
        return val;
    });
});

test("catch", $val, function () {
    return new Yaku(function (nil, reject) {
        return reject($val);
    })["catch"](function (val) {
        return val;
    });
});

test("chain", "ok", function () {
    return Yaku.resolve().then(function () {
        return new Yaku(function (r) {
            return setTimeout(function () {
                return r("ok");
            }, 10);
        });
    });
});

Yaku.resolve().then(function () {
    return test("unhandled rejection", $val, function () {
        return new Yaku(function (r) {
            var old;
            old = Yaku.onUnhandledRejection;
            Yaku.onUnhandledRejection = function (reason) {
                Yaku.onUnhandledRejection = old;
                return r(reason);
            };
            return Yaku.resolve().then(function () {
                return Yaku.reject($val);
            });
        });
    });
}).then(function () {
    return test("no unhandled rejection", $val, function () {
        return new Yaku(function (resolve, reject) {
            var old;
            old = Yaku.onUnhandledRejection;
            Yaku.onUnhandledRejection = function () {
                Yaku.onUnhandledRejection = old;
                return reject();
            };
            return Yaku.reject()["catch"](function () {
                return setTimeout(function () {
                    return resolve($val);
                }, 100);
            });
        });
    });
}).then(function () {
    return test("unhandled rejection inside a catch", $val, function () {
        return new Yaku(function (r) {
            var old;
            old = Yaku.onUnhandledRejection;
            Yaku.onUnhandledRejection = function (reason) {
                Yaku.onUnhandledRejection = old;
                return r(reason);
            };
            return Yaku.reject()["catch"](function () {
                return Yaku.reject($val);
            });
        });
    });
}).then(function () {
    return test("unhandled rejection only once", 1, function () {
        var count, old;
        old = Yaku.onUnhandledRejection;
        count = 0;
        Yaku.onUnhandledRejection = function () {
            return count++;
        };
        Yaku.reject().then(function () {
            return $val;
        });
        return new Yaku(function (r) {
            return setTimeout(function () {
                Yaku.onUnhandledRejection = old;
                return r(count);
            }, 50);
        });
    });
}).then(function () {
    return test("long stack trace", 2, function () {
        Yaku.enableLongStackTrace();
        return Yaku.resolve().then(function () {
            throw "abc";
        })["catch"](function (err) {
            return err.stack.match(/From previous event:/g).length;
        });
    });
});

randomPromise = function (i) {
    return new Yaku(function (r) {
        return setTimeout(function () {
            return r(i);
        }, Math.random() * 100);
    });
};

test("empty all", [], function () {
    return Yaku.all([]);
});

test("all", [1, "test", "x", 10, 0], function () {
    return Yaku.all([
        randomPromise(1), randomPromise("test"), Yaku.resolve("x"), new Yaku(function (r) {
            return setTimeout(function () {
                return r(10);
            }, 10);
        }), new Yaku(function (r) {
            return r(0);
        })
    ]);
});

test("empty race", [], function () {
    return Yaku.race([]);
});

test("race", 0, function () {
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
});

test("async array", [0, null, void 0, 1, 2, 3], function () {
    var list;
    list = [
        function () {
            return 0;
        }, function () {
            return null;
        }, function () {
            return void 0;
        }, function () {
            return utils.sleep(20, 1);
        }, function () {
            return utils.sleep(10, 2);
        }, function () {
            return utils.sleep(10, 3);
        }
    ];
    return utils.async(2, list);
});

test("async error", $val, function () {
    var list;
    list = [
        function () {
            return utils.sleep(10, 1);
        }, function () {
            throw $val;
        }, function () {
            return utils.sleep(10, 3);
        }
    ];
    return utils.async(2, list)["catch"](function (err) {
        return err;
    });
});

test("async iter progress", 10, function () {
    var count, iter;
    iter = function () {
        var i;
        i = 0;
        return function () {
            if (i++ === 10) {
                return utils.end;
            }
            return new Yaku(function (r) {
                return setTimeout((function () {
                    return r(1);
                }), 10);
            });
        };
    };
    count = 0;
    return utils.async(3, iter(), false, function (ret) {
        return count += ret;
    }).then(function () {
        return count;
    });
});

test("flow array", "bc", function () {
    return (utils.flow([
        "a", Yaku.resolve("b"), function (v) {
            return v + "c";
        }
    ]))(0);
});

test("flow error", $val, function () {
    return (utils.flow([
        "a", Yaku.resolve("b"), function () {
            throw $val;
        }
    ]))(0)["catch"](function (err) {
        return err;
    });
});

test("flow iter", [0, 1, 2, 3], function () {
    var list;
    list = [];
    return (utils.flow(function (v) {
        if (v === 3) {
            return utils.end;
        }
        return Yaku.resolve().then(function () {
            list.push(v);
            return ++v;
        });
    }))(0).then(function (v) {
        list.push(v);
        return list;
    });
});

test("promisify promise", 1, function () {
    var fn;
    fn = utils.promisify(function (val, cb) {
        return setTimeout(function () {
            return cb(null, val + 1);
        });
    });
    return fn(0);
});

test("promisify callback", 1, function () {
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

test("source", "out: 4", function () {
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
});

test("source error", "error", function () {
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
});

test("source children", "ok", function () {
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
});

test("retry once", "ok", function () {
    var fn;
    fn = function (val) {
        return val;
    };
    return utils.retry(3, fn)("ok");
});

test("retry 2 times", "ok", function () {
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

test("retry 3 times", ["err0", "err1", "err2"], function () {
    var count, fn;
    count = 0;
    fn = function () {
        throw "err" + count++;
    };
    return utils.retry(3, fn)()["catch"](function (errs) {
        return errs;
    });
});
