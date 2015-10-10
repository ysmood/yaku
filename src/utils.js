// This file contains all the non-ES6-standard helpers based on promise.

module.exports = {

    /**
     * A function that helps run functions under a concurrent limitation.
     * To run functions sequentially, use `yaku/lib/flow`.
     * @param  {Int} limit The max task to run at a time. It's optional.
     * Default is `Infinity`.
     * @param  {Array | Function} list
     * If the list is an array, it should be a list of functions or promises,
     * and each function will return a promise.
     * If the list is a function, it should be a iterator that returns
     * a promise, when it returns `yaku/lib/end`, the iteration ends. Of course
     * it can never end.
     * @param {Boolean} saveResults Whether to save each promise's result or
     * not. Default is true.
     * @param {Function} progress If a task ends, the resolved value will be
     * passed to this function.
     * @return {Promise}
     * @example
     * ```js
     * var kit = require('nokit');
     * var async = require('yaku/lib/async');
     * var end = require('yaku/lib/end');
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
     * async(tasks).then(() => kit.log('all done!'));
     *
     * async(2, tasks).then(() => kit.log('max concurrent limit is 2'));
     *
     * async(3, () => {
     *     var url = urls.pop();
     *     if (url)
     *         return kit.request(url);
     *     else
     *         return end;
     * })
     * .then(() => kit.log('all done!'));
     * ```
     */
    async: require("./async"),

    /**
     * If a function returns promise, convert it to
     * node callback style function.
     * @param  {Function} fn
     * @param  {Any} self The `this` to bind to the fn.
     * @return {Function}
     */
    callbackify: require("./callbackify"),

    /**
     * **deprecate** Create a `jQuery.Deferred` like object.
     * It will cause some buggy problems, please don't use it.
     */
    Deferred: require("./Deferred"),

    /**
     * The end symbol.
     * @return {Promise} A promise that will end the current pipeline.
     */
    end: require("./end"),

    /**
     * Creates a function that is the composition of the provided functions.
     * Besides, it can also accept async function that returns promise.
     * See `yaku/lib/async`, if you need concurrent support.
     * @param  {Function | Array} fns Functions that return
     * promise or any value.
     * And the array can also contains promises or values other than function.
     * If there's only one argument and it's a function, it will be treated as an iterator,
     * when it returns `yaku/lib/end`, the iteration ends.
     * @return {Function} `(val) -> Promise` A function that will return a promise.
     * @example
     * It helps to decouple sequential pipeline code logic.
     * ```js
     * var kit = require('nokit');
     * var flow = require('yaku/lib/flow');
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
     * var download = flow(createUrl, curl, save);
     * // same as "download = flow([createUrl, curl, save])"
     *
     * download('home');
     * ```
     * @example
     * Walk through first link of each page.
     * ```js
     * var kit = require('nokit');
     * var flow = require('yaku/lib/flow');
     * var end = require('yaku/lib/end');
     *
     * var list = [];
     * function iter (url) {
     *  if (!url) return end;
     *
     *  return kit.request(url)
     *  .then((body) => {
     *      list.push(body);
     *      var m = body.match(/href="(.+?)"/);
     *      if (m) return m[0];
     *  });
     * }
     *
     * var walker = flow(iter);
     * walker('test.com');
     * ```
     */
    flow: require("./flow"),

    /**
     * A function to make Yaku emit global rejection events.
     */
    globalizeUnhandledRejection: require("./globalizeUnhandledRejection"),

    /**
     * **deprecate** Check if an object is a promise-like object.
     * Don't use it to coercive a value to Promise, instead use `Promise.resolve`.
     * @param  {Any}  obj
     * @return {Boolean}
     */
    isPromise: require("./isPromise"),

    /**
     * Convert a node callback style function to a function that returns
     * promise when the last callback is not supplied.
     * @param  {Function} fn
     * @param  {Any} self The `this` to bind to the fn.
     * @return {Function}
     * @example
     * ```js
     * var promisify = require('yaku/lib/promisify');
     * function foo (val, cb) {
     *     setTimeout(() => {
     *         cb(null, val + 1);
     *     });
     * }
     *
     * var bar = promisify(foo);
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
    promisify: require("./promisify"),

    /**
     * Create a promise that will wait for a while before resolution.
     * @param  {Integer} time The unit is millisecond.
     * @param  {Any} val What the value this promise will resolve.
     * @return {Promise}
     * @example
     * ```js
     * var sleep = require('yaku/lib/sleep');
     * sleep(1000).then(() => console.log('after one second'));
     * ```
     */
    sleep: require("./sleep"),

    /**
     * Create a composable event source function.
     * Promise can't resolve multiple times, this function makes it possible, so
     * that you can easily map, filter and debounce events in a promise way.
     * For real world example: [Double Click Demo](https://jsfiddle.net/ysmood/musds0sv/).
     * @version_added v0.7.2
     * @param {Function} executor `(emit) ->` It's optional.
     * @return {Function} `(onEmit, onError) ->` The function's
     * members:
     * ```js
     * {
     *     emit: (value) => { \/* ... *\/ },
     *
     *     // Get current value from it.
     *     value: Promise,
     *
     *     // All the children spawned from current source.
     *     children: Array
     * }
     * ```
     * @example
     * ```js
     * var source = require("yaku/lib/source");
     * var linear = source();
     *
     * var x = 0;
     * setInterval(() => {
     *     linear.emit(x++);
     * }, 1000);
     *
     * // Wait for a moment then emit the value.
     * var quad = linear(async x => {
     *     await sleep(2000);
     *     return x * x;
     * });
     *
     * var another = linear(x => -x);
     *
     * quad(
     *     value => { console.log(value); },
     *     reason => { console.error(reason); }
     * );
     *
     * // Emit error
     * linear.emit(Promise.reject("reason"));
     *
     * // Dispose a specific source.
     * linear.children.splice(linear.children.indexOf(quad));
     *
     * // Dispose all children.
     * linear.children = [];
     * ```
     * @example
     * Use it with DOM.
     * ```js
     * var filter = fn => v => fn(v) ? v : new Promise(() => {});
     *
     * var keyup = source((emit) => {
     *     document.querySelector('input').onkeyup = emit;
     * });
     *
     * var keyupText = keyup(e => e.target.value);
     *
     * // Now we only get the input when the text length is greater than 3.
     * var keyupTextGT3 = keyupText(filter(text => text.length > 3));
     *
     * keyupTextGT3(v => console.log(v));
     * ```
     * @example
     * Merge two sources into one.
     * ```js
     * let one = source(emit => setInterval(emit, 100, 'one'));
     * let two = source(emit => setInterval(emit, 200, 'two'));
     * let merge = arr => arr.forEach(src => src(emit));
     *
     * let three = merge([one, two]);
     * three(v => console.log(v));
     * ```
     */
    source: require("./source"),

    /**
     * Retry a function until it resolves before a mount of times, or reject with all
     * the error states.
     * @version_added v0.7.10
     * @param  {Number | Function} countdown How many times to retry before rejection.
     * When it's a function `(errs) => Boolean | Promise.resolve(Boolean)`,
     * you can use it to create complex countdown logic,
     * it can even return a promise to create async countdown logic.
     * @param  {Function} fn The function can return a promise or not.
     * @param  {Any} this Optional. The context to call the function.
     * @return {Function} The wrapped function. The function will reject an array
     * of reasons that throwed by each try.
     * @example
     * Retry 3 times before rejection.
     * ```js
     * var retry = require('yaku/lib/retry');
     * var { request } = require('nokit');
     *
     * retry(3, request)('http://test.com').then(
     *    (body) => console.log(body),
     *    (errs) => console.error(errs)
     * );
     * ```
     * @example
     * Here a more complex retry usage, it shows an random exponential backoff algorithm to
     * wait and retry again, which means the 10th attempt may take 10 minutes to happen.
     * ```js
     * var retry = require('yaku/lib/retry');
     * var sleep = require('yaku/lib/sleep');
     * var { request } = require('nokit');
     *
     * function countdown (retries) {
     *    var attempt = 0;
     *    return async () => {
     *         var r = Math.random() * Math.pow(2, attempt) * 1000;
     *         var t = Math.min(r, 1000 * 60 * 10);
     *         await sleep(t);
     *         attempt++ < retries;
     *    };
     * }
     *
     * retry(countdown(10), request)('http://test.com').then(
     *    (body) => console.log(body),
     *    (errs) => console.error(errs)
     * );
     * ```
     */
    retry: require("./retry"),

    /**
     * Throw an error to break the program.
     * @param  {Any} err
     * @example
     * ```js
     * var ythrow = require('yaku/lib/throw');
     * Promise.resolve().then(() => {
     *     // This error won't be caught by promise.
     *     ythrow('break the program!');
     * });
     * ```
     */
    "throw": require("./throw")
};
