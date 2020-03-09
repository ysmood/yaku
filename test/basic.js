/**
 * Here's some fundamental function tests for Promise, so it should work on different Promise libs,
 * such as Bluebird, Q, or Yaku itself.
 */

var getPromise = require('../test/getPromise');
var Promise = getPromise(process.env.shim);
var testSuit = require('./testSuit');
var setPrototypeOf = require('setprototypeof');

var Symbol = global.Symbol || {};
if (!Symbol.species)
    Symbol.species = 'Symbol(species)';

function sleep (time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time);
    });
}

module.exports = testSuit('basic', function (it) {

    it('resolve order', ['DEHAFGBC', 'DEHAFGBC'], function () {
        return new Promise(function (assertResolve) {
            var assertRes = [];
            var result = '';
            var resolve, resolve2;

            var p = new Promise(function (r) {
                resolve = r;
            });

            resolve({
                then: function () {
                    result += 'A';
                    throw Error();
                }
            });

            p['catch'](function () {
                result += 'B';
            });
            p['catch'](function () {
                result += 'C';
                assertRes.push(result);
            });

            var p2 = new Promise(function (r) {
                resolve2 = r;
            });
            resolve2(Object.defineProperty({}, 'then', {
                get: function () {
                    result += 'D';
                    throw Error();
                }
            }));
            result += 'E';
            p2['catch'](function () {
                result += 'F';
            });
            p2['catch'](function () {
                result += 'G';
            });
            result += 'H';
            setTimeout(function () {
                if (~result.indexOf('C')) {
                    assertRes.push(result);
                }

                assertResolve(assertRes);
            }, 100);
        });
    });

    it('resolve', 'val', function () {
        return new Promise(function (resolve) {
            return resolve('val');
        });
    });

    it('resolve promise like value', 'val', function () {
        return new Promise(function (resolve) {
            return resolve({
                then: function (fulfil) {
                    return fulfil('val');
                }
            });
        });
    });

    it('resolve another promise with an extra resolve', 'ok', function () {
        var val = Promise.resolve('ok');

        return new Promise(function (resolve) {
            resolve(val);
            resolve('no');
        });
    });

    it('constructor throw', 'val', function () {
        return new Promise(function () {
            throw 'val';
        })['catch'](function (e) {
            return e;
        });
    });

    it('resolve static', 'val', function () {
        return Promise.resolve('val');
    });

    it('resolve promise', 'val', function () {
        return Promise.resolve(Promise.resolve('val'));
    });

    it('reject', 'val', function () {
        return Promise.reject('val')['catch'](function (val) {
            return val;
        });
    });

    it('catch', 'val', function () {
        return new Promise(function (nil, reject) {
            return reject('val');
        })['catch'](function (val) {
            return val;
        });
    });

    it('circular chain', TypeError, function () {
        var p = Promise.resolve().then(function () {
            return p;
        });

        return p['catch'](function (err) {
            return err.constructor;
        });
    });

    it('chain', 'ok', function () {
        return Promise.resolve().then(function () {
            return new Promise(function (r) {
                return setTimeout(function () {
                    return r('ok');
                }, 10);
            });
        });
    });

    it('when context is null', 'Invalid this', function () {
        try {
            Promise.call(null);
        } catch (err) {
            return err.message;
        }
    });

    it('when executor is null', 'Invalid argument', function () {
        try {
            new Promise(null);
        } catch (err) {
            return err.message;
        }
    });

    it('when yaku.prototype.then\'s context is not yaku', TypeError, function () {
        try {
            var p = new Promise(function () {});
            p.then.call({});
        } catch (err) {
            return err.constructor;
        }
    });

    it('all with empty', [], function () {
        return Promise.all([]);
    });

    it('all with es5 array', [1, 2, 3], function () {
        function es5Array () {
            var arr = [];
            arr.push.apply(arr, arguments);
            arr.__proto__ = es5Array.prototype;
            return arr;
        }
        es5Array.prototype = new Array;

        var a = new es5Array(1, 2, 3);

        a[Symbol.iterator] = null;

        return Promise.all(a);
    });

    it('all reject', 'err', function () {
        return Promise.all([
            Promise.reject('err')
        ])['catch'](function (err) { return err; });
    });

    it('all with null', true, function () {
        return Promise.all(null)['catch'](function (err) {
            return err instanceof TypeError;
        });
    });

    it('all with array like', true, function () {
        return Promise.all({
            '0': 1, '1': 2, '2': 3, length: 3
        })['catch'](function (err) {
            return err instanceof TypeError;
        });
    });

    it('all', [1, 'test', 'x', 10, 0], function () {
        function randomPromise (i) {
            return new Promise(function (r) {
                return setTimeout(function () {
                    return r(i);
                }, Math.random() * 10);
            });
        }

        return Promise.all([
            randomPromise(1), randomPromise('test'), Promise.resolve('x'), new Promise(function (r) {
                return setTimeout(function () {
                    return r(10);
                }, 1);
            }), new Promise(function (r) {
                return r(0);
            })
        ]);
    });

    it('all with custom Symbol.iterator', [1, 2, 3], function () {
        var arr = [];

        if (!Symbol.iterator)
            // skip the test
            return [1, 2, 3];

        arr[Symbol.iterator] = function () {
            return [1, 2, 3][Symbol.iterator]();
        };

        return Promise.all(arr);
    });

    it('all with iterator like', [1, 2, 3], function () {
        var arr = {
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

    it('all with iterator like, iteration error', 'error', function () {
        var arr = {
            next: function () {
                throw 'error';
            }
        };
        arr[Symbol.iterator] = function () { return this; };

        return Promise.all(arr)['catch'](function (err) {
            return err;
        });
    });

    it('all with iterator like, iteration', ['ok', 'ok', 'ok'], function () {
        var iter = {
            count: 3,
            next: function () {
                return {
                    value: 'ok',
                    done: !this.count--
                };
            }
        };
        return Promise.all(iter);
    });

    it('all with iterator like, resolve error', 'clean', function () {
        function SubPromise (it) {
            var self = new Promise(it);
            setPrototypeOf(self, SubPromise.prototype);
            return self;
        }

        setPrototypeOf(SubPromise, Promise);
        SubPromise.prototype = Object.create(Promise.prototype);
        SubPromise.prototype.constructor = SubPromise;

        return new Promise(function (resolve) {
            var arr = {
                count: 2,
                'return': function () {
                    resolve('clean');
                },
                next: function () {
                    return {
                        done: !--this.count
                    };
                }
            };
            arr[Symbol.iterator] = function () { return this; };

            SubPromise.resolve = function () { throw 'err'; };

            SubPromise.all(arr)['catch'](function () {});
        });
    });

    it('allSettled ends with resolve', [{status: 'fulfilled', value: 3}], function () {
        return Promise.allSettled([
            Promise.resolve(3)
        ]);
    });

    it('allSettled ends with reject', [{status: 'fulfilled', value: 3}, {status: 'rejected', reason: 'foo'}], function () {
        return Promise.allSettled([
            Promise.resolve(3),
            new Promise(function (resolve, reject) { setTimeout(reject, 100, 'foo'); })
        ]);
    });

    it('allSettled empty', [], function () {
        return Promise.allSettled([]);
    });

    it('allSettled with iterator like, iteration error', 'error', function () {
        var arr = {
            next: function () {
                throw 'error';
            }
        };
        arr[Symbol.iterator] = function () { return this; };

        return Promise.allSettled(arr)['catch'](function (err) {
            return err;
        });
    });

    it('race with empty should never resolve', 'ok', function () {
        return new Promise(function (resolve) {
            Promise.race([]).then(function () {
                resolve('err');
            });

            sleep(30).then(function () {
                resolve('ok');
            });
        });
    });

    it('race with null', true, function () {
        return Promise.race(null)['catch'](function (err) {
            return err instanceof TypeError;
        });
    });

    it('race', 0, function () {
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

    it('race reject', 'err', function () {
        return Promise.race([
            new Promise(function (r) {
                return setTimeout(function () {
                    return r(0);
                });
            }),
            new Promise(function (r, rr) {
                return rr('err');
            })
        ])['catch'](function (err) { return err; });
    });

    it('race with custom Symbol.iterator', 1, function () {
        var arr = [];

        if (!Symbol.iterator)
            // skip the test
            return 1;

        arr[Symbol.iterator] = function () {
            return [1, 2, 3][Symbol.iterator]();
        };

        return Promise.race(arr);
    });

    it('race with iterator like', 1, function () {
        var arr = {
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

    it('race with iterator like, iteration error', 'error', function () {
        var arr = {
            next: function () {
                throw 'error';
            }
        };
        arr[Symbol.iterator] = function () { return this; };

        return Promise.race(arr)['catch'](function (err) {
            return err;
        });
    });

    it('race with iterator like, resolve error', 'clean', function () {
        function SubPromise (it) {
            var self;
            self = new Promise(it);
            setPrototypeOf(self, SubPromise.prototype);
            return self;
        }

        setPrototypeOf(SubPromise, Promise);
        SubPromise.prototype = Object.create(Promise.prototype);
        SubPromise.prototype.constructor = SubPromise;

        return new Promise(function (resolve) {
            var arr = {
                count: 2,
                'return': function () {
                    resolve('clean');
                },
                next: function () {
                    return {
                        done: !--this.count
                    };
                }
            };
            arr[Symbol.iterator] = function () { return this; };

            SubPromise.resolve = function () { throw 'err'; };

            SubPromise.race(arr)['catch'](function () {});
        });
    });

    it('subclass', ['subclass', 'subclass', 'subclass', 'subclass', 'subclass', true, true, 5, 6], function () {
        function SubPromise (it) {
            var self;
            self = new Promise(it);
            setPrototypeOf(self, SubPromise.prototype);
            self.mine = 'subclass';
            return self;
        }

        var result = [];

        setPrototypeOf(SubPromise, Promise);
        SubPromise.prototype = Object.create(Promise.prototype);
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
        result.push(p3 instanceof Promise);
        result.push(p3 instanceof SubPromise);

        return p3.then(sleep(50), function (it) {
            return result.push(it);
        }).then(function () {
            return result;
        });
    });

    it('subclass with forged constructor', 'ok', function () {
        Symbol.species = 'Symbol(species)';

        var SubPromise = function () {};
        var ret;

        SubPromise.prototype = Promise;
        SubPromise[Symbol.species] = function (executor) {
            executor(function () {}, function () {});

            ret = 'ok';
        };

        var p = Promise.resolve();

        p.constructor = SubPromise;

        p.then(function () {});

        return ret;
    });

    it('subclass with forged constructor error', TypeError, function () {
        Symbol.species = 'Symbol(species)';

        var SubPromise = function () {};

        return new Promise(function (r) {
            SubPromise.prototype = Promise;
            SubPromise[Symbol.species] = function (executor) {
                executor(function () {}, function () {});
                setTimeout(function () {
                    try {
                        executor(function () {}, function () {});
                    } catch (err) {
                        r(err.constructor);
                    }
                });
            };

            var p = Promise.resolve();

            p.constructor = SubPromise;

            p.then(function () {});
        });
    });

    it('subclass with forged constructor executor without handler', TypeError, function () {
        Symbol.species = 'Symbol(species)';

        var SubPromise = function () {};

        SubPromise.prototype = Promise;
        SubPromise[Symbol.species] = function (executor) {
            executor();
        };

        var p = Promise.resolve();

        p.constructor = SubPromise;

        try {
            p.then(function () {});
        } catch (err) {
            return err.constructor;
        }
    });

    it('subclass with null constructor', 'ok', function () {
        Symbol.species = 'Symbol(species)';
        var p = Promise.resolve();

        p.constructor = null;

        return p.then(function () {
            return 'ok';
        });
    });

    it('subclass PromiseCapability promise.then', true, function () {
        var promise, FakePromise1, FakePromise2;
        promise = new Promise(function (it){ it(42); });

        promise.constructor = FakePromise1 = function a (it){
            it(function () {}, function () {});
        };

        FakePromise1[Symbol.species] = FakePromise2 = function b (it){
            it(function () {}, function () {});
        };
        setPrototypeOf(FakePromise2, Promise);

        return promise.then(function () {}) instanceof FakePromise2;
    });

    it('subclass PromiseCapability fake constructor promise.then', 'ok', function () {
        var promise = new Promise(function (it){ it(42); });

        promise.constructor = function () { };

        return promise.then(function () {
            return 'ok';
        });
    });

});
