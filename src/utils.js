// This file contains all the non-ES6-standard helpers based on promise.

isNumber = function(obj) {
    return typeof obj === 'number';
};

isArray = function(obj) {
    return obj instanceof Array;
};

isFunction = function(obj) {
    return typeof obj === 'function';
};

var Promise = require('./yaku')
, slice = [].slice
, utils = module.exports = {

    /**
     * An throttled version of `Promise.all`, it runs all the tasks under
     * a concurrent limitation.
     * To run tasks sequentially, use `utils.flow`.
     * @param  {Int} limit The max task to run at a time. It's optional.
     * Default is `Infinity`.
     * @param  {Array | Function} list
     * If the list is an array, it should be a list of functions or promises,
     * and each function will return a promise.
     * If the list is a function, it should be a iterator that returns
     * a promise, when it returns `utils.end`, the iteration ends. Of course
     * it can never end.
     * @param {Boolean} saveResults Whether to save each promise's result or
     * not. Default is true.
     * @param {Function} progress If a task ends, the resolved value will be
     * passed to this function.
     * @return {Promise}
     * @example
     * ```js
     * var kit = require('nokit');
     * var utils = require('yaku/lib/utils');
     *
     * var urls = [
     *     'http://a.com',
     *     'http://b.com',
     *     'http://c.com',
     *     'http://d.com'
     * ];
     * var tasks = [
     *     () => kit.request(url[0]),
     *     () => kit.request(url[1]),
     *     () => kit.request(url[2]),
     *     () => kit.request(url[3])
     * ];
     *
     * utils.async(tasks).then(() => kit.log('all done!'));
     *
     * utils.async(2, tasks).then(() => kit.log('max concurrent limit is 2'));
     *
     * utils.async(3, () => {
     *     var url = urls.pop();
     *     if (url)
     *         return kit.request(url);
     *     else
     *         return utils.end;
     * })
     * .then(() => kit.log('all done!'));
     * ```
     */
    async: function(limit, list, saveResults, progress) {
        var isIterDone, iter, iterIndex, resutls, running;
        resutls = [];
        running = 0;
        isIterDone = false;
        iterIndex = 0;
        if (!isNumber(limit)) {
            progress = saveResults;
            saveResults = list;
            list = limit;
            limit = Infinity;
        }
        if (saveResults == null) {
            saveResults = true;
        }
        if (isArray(list)) {
            iter = function() {
                var el;
                el = list[iterIndex];
                if (el === void 0) {
                    return utils.end;
                } else if (isFunction(el)) {
                    return el();
                } else {
                    return el;
                }
            };
        } else if (isFunction(list)) {
            iter = list;
        } else {
            throw new TypeError('wrong argument type: ' + list);
        }
        return new Promise(function(resolve, reject) {
            var addTask, allDone, i, results;
            addTask = function() {
                var index, p, task;
                task = iter();
                index = iterIndex++;
                if (isIterDone || task === utils.end) {
                    isIterDone = true;
                    if (running === 0) {
                        allDone();
                    }
                    return false;
                }
                if (utils.isPromise(task)) {
                    p = task;
                } else {
                    p = Promise.resolve(task);
                }
                running++;
                p.then(function(ret) {
                    running--;
                    if (saveResults) {
                        resutls[index] = ret;
                    }
                    if (typeof progress === "function") {
                        progress(ret);
                    }
                    return addTask();
                })["catch"](function(err) {
                    running--;
                    return reject(err);
                });
                return true;
            };
            allDone = function() {
                if (saveResults) {
                    return resolve(resutls);
                } else {
                    return resolve();
                }
            };
            i = limit;
            results = [];
            while (i--) {
                if (!addTask()) {
                    break;
                } else {
                    results.push(void 0);
                }
            }
            return results;
        });
    },

    /**
     * If a function returns promise, convert it to
     * node callback style function.
     * @param  {Function} fn
     * @param  {Any} self The `this` to bind to the fn.
     * @return {Function}
     */
    callbackify: function(fn, self) {
        return function() {
            var args, cb, j;
            args = 2 <= arguments.length ? slice.call(arguments, 0, j = arguments.length - 1) : (j = 0, []), cb = arguments[j++];
            if (!isFunction(cb)) {
                args.push(cb);
                return fn.apply(self, args);
            }
            if (arguments.length === 1) {
                args = [cb];
                cb = null;
            }
            return fn.apply(self, args).then(function(val) {
                return typeof cb === "function" ? cb(null, val) : void 0;
            })["catch"](function(err) {
                if (cb) {
                    return cb(err);
                } else {
                    return Promise.reject(err);
                }
            });
        };
    },

    /**
     * Create a `jQuery.Deferred` like object.
     */
    Deferred: function() {
        var defer;
        defer = {};
        defer.promise = new Promise(function(resolve, reject) {
            defer.resolve = resolve;
            return defer.reject = reject;
        });
        return defer;
    },

    /**
     * The end symbol.
     * @return {Promise} A promise that will end the current pipeline.
     */
    end: function() {
        return new Promise(function() {});
    },

    /**
     * Creates a function that is the composition of the provided functions.
     * Besides, it can also accept async function that returns promise.
     * See `utils.async`, if you need concurrent support.
     * @param  {Function | Array} fns Functions that return
     * promise or any value.
     * And the array can also contains promises or values other than function.
     * If there's only one argument and it's a function, it will be treated as an iterator,
     * when it returns `utils.end`, the iteration ends.
     * @return {Function} `(val) -> Promise` A function that will return a promise.
     * @example
     * It helps to decouple sequential pipeline code logic.
     * ```js
     * var kit = require('nokit');
     * var utils = require('yaku/lib/utils');
     *
     * function createUrl (name) {
     *     return "http://test.com/" + name;
     * }
     *
     * function curl (url) {
     *     return kit.request(url).then((body) => {
     *         kit.log('get');
     *         return body;
     *     });
     * }
     *
     * function save (str) {
     *     kit.outputFile('a.txt', str).then(() => {
     *         kit.log('saved');
     *     });
     * }
     *
     * var download = utils.flow(createUrl, curl, save);
     * // same as "download = utils.flow([createUrl, curl, save])"
     *
     * download('home');
     * ```
     * @example
     * Walk through first link of each page.
     * ```js
     * var kit = require('nokit');
     * var utils = require('yaku/lib/utils');
     *
     * var list = [];
     * function iter (url) {
     *  if (!url) return utils.end;
     *
     *  return kit.request(url)
     *  .then((body) => {
     *      list.push(body);
     *      var m = body.match(/href="(.+?)"/);
     *      if (m) return m[0];
     *  });
     * }
     *
     * var walker = utils.flow(iter);
     * walker('test.com');
     * ```
     */
    flow: function() {
        var fns;
        fns = 1 <= arguments.length ? slice.call(arguments, 0) : [];
        return function(val) {
            var genIter, iter, run;
            genIter = function(arr) {
                var iterIndex;
                iterIndex = 0;
                return function(val) {
                    var fn;
                    fn = arr[iterIndex++];
                    if (fn === void 0) {
                        return utils.end;
                    } else if (isFunction(fn)) {
                        return fn(val);
                    } else {
                        return fn;
                    }
                };
            };
            if (isArray(fns[0])) {
                iter = genIter(fns[0]);
            } else if (fns.length === 1 && isFunction(fns[0])) {
                iter = fns[0];
            } else if (fns.length > 1) {
                iter = genIter(fns);
            } else {
                throw new TypeError('wrong argument type: ' + fn);
            }
            run = function(preFn) {
                return preFn.then(function(val) {
                    var fn;
                    fn = iter(val);
                    if (fn === utils.end) {
                        return val;
                    }
                    return run(utils.isPromise(fn) ? fn : isFunction(fn) ? Promise.resolve(fn(val)) : Promise.resolve(fn));
                });
            };
            return run(Promise.resolve(val));
        };
    },

    /**
     * Check if an object is a promise-like object.
     * @param  {Any}  obj
     * @return {Boolean}
     */
    isPromise: function(obj) {
        return obj && isFunction(obj.then);
    },

    /**
     * Convert a node callback style function to a function that returns
     * promise when the last callback is not supplied.
     * @param  {Function} fn
     * @param  {Any} self The `this` to bind to the fn.
     * @return {Function}
     * @example
     * ```js
     * function foo (val, cb) {
     *     setTimeout(() => {
     *         cb(null, val + 1);
     *     });
     * }
     *
     * var bar = utils.promisify(foo);
     *
     * bar(0).then((val) => {
     *     console.log val // output => 1
     * });
     *
     * // It also supports the callback style.
     * bar(0, (err, val) => {
     *     console.log(val); // output => 1
     * });
     * ```
     */
    promisify: function(fn, self) {
        return function() {
            var args;
            args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
            if (isFunction(args[args.length - 1])) {
                return fn.apply(self, args);
            }
            return new Promise(function(resolve, reject) {
                args.push(function() {
                    if (arguments[0] != null) {
                        return reject(arguments[0]);
                    } else {
                        return resolve(arguments[1]);
                    }
                });
                return fn.apply(self, args);
            });
        };
    },

    /**
     * Create a promise that will wait for a while before resolution.
     * @param  {Integer} time The unit is millisecond.
     * @param  {Any} val What the value this promise will resolve.
     * @return {Promise}
     * @example
     * ```js
     * utils.sleep(1000).then(() => console.log('after one second'));
     * ```
     */
    sleep: function(time, val) {
        return new Promise(function(r) {
            return setTimeout((function() {
                return r(val);
            }), time);
        });
    },

    /**
     * Throw an error to break the program.
     * @param  {Any} err
     * @example
     * ```js
     * Promise.resolve().then(() => {
     *     // This error won't be caught by promise.
     *     utils.throw('break the program!');
     * });
     * ```
     */
    "throw": function(err) {
        setTimeout(function() {
            throw err;
        });
    }
};
