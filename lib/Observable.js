"use strict";
var genIterator_1 = require("./genIterator");
var yaku_1 = require("./yaku");
/**
 * Create a composable observable object.
 * Promise can't resolve multiple times, this class makes it possible, so
 * that you can easily map, filter and even back pressure events in a promise way.
 * For live example: [Double Click Demo](https://jsbin.com/niwuti/edit?html,js,output).
 * @version_added v0.7.2
 * @param {Function} executor `(next) ->` It's optional.
 * @return {Observable}
 * @example
 * ```js
 * var Observable = require("yaku/lib/Observable");
 * var linear = new Observable();
 *
 * var x = 0;
 * setInterval(linear.next, 1000, x++);
 *
 * // Wait for 2 sec then emit the next value.
 * var quad = linear.subscribe(async x => {
 *     await sleep(2000);
 *     return x * x;
 * });
 *
 * var another = linear.subscribe(x => -x);
 *
 * quad.subscribe(
 *     value => { console.log(value); },
 *     reason => { console.error(reason); }
 * );
 *
 * // Emit error
 * linear.error(new Error("reason"));
 *
 * // Unsubscribe an observable.
 * quad.unsubscribe();
 *
 * // Unsubscribe all subscribers.
 * linear.subscribers = [];
 * ```
 * @example
 * Use it with DOM.
 * ```js
 * var filter = fn => v => fn(v) ? v : new Promise(() => {});
 *
 * var keyup = new Observable((next) => {
 *     document.querySelector('input').onkeyup = next;
 * });
 *
 * var keyupText = keyup.subscribe(e => e.target.value);
 *
 * // Now we only get the input when the text length is greater than 3.
 * var keyupTextGT3 = keyupText.subscribe(filter(text => text.length > 3));
 *
 * keyupTextGT3.subscribe(v => console.log(v));
 * ```
 */
var Observable = (function () {
    function Observable(executor) {
        /**
         * Emit a value.
         * @param  {Any} value
         * so that the event will go to `onError` callback.
         */
        this.next = null;
        /**
         * Emit an error.
         * @param  {Any} value
         */
        this.error = null;
        /**
         * The publisher observable of this.
         * @type {Observable}
         */
        this.publisher = null;
        /**
         * All the subscribers subscribed this observable.
         * @type {Array}
         */
        this.subscribers = null;
        var self = this;
        genHandler(self);
        self.subscribers = [];
        executor && executor(self.next, self.error);
    }
    ;
    /**
     * It will create a new Observable, like promise.
     * @param  {Function} onNext
     * @param  {Function} onError
     * @return {Observable}
     */
    Observable.prototype.subscribe = function (onNext, onError) {
        var self = this;
        var subscriber = new Observable();
        subscriber._onNext = onNext;
        subscriber._onError = onError;
        subscriber._nextErr = genNextErr(subscriber.next);
        subscriber.publisher = self;
        self.subscribers.push(subscriber);
        return subscriber;
    };
    /**
     * Unsubscribe this.
     */
    Observable.prototype.unsubscribe = function () {
        var publisher = this.publisher;
        publisher && publisher.subscribers.splice(publisher.subscribers.indexOf(this), 1);
    };
    /**
     * Merge multiple observables into one.
     * @version_added 0.9.6
     * @param  {Iterable} iterable
     * @return {Observable}
     * @example
     * ```js
     * var Observable = require("yaku/lib/Observable");
     * var sleep = require("yaku/lib/sleep");
     *
     * var src = new Observable(next => setInterval(next, 1000, 0));
     *
     * var a = src.subscribe(v => v + 1; });
     * var b = src.subscribe((v) => sleep(10, v + 2));
     *
     * var out = Observable.merge([a, b]);
     *
     * out.subscribe((v) => {
     *     console.log(v);
     * })
     * ```
     */
    Observable.merge = function (iterable) {
        var iter = genIterator_1["default"](iterable);
        return new Observable(function (next) {
            var item;
            function onError(e) {
                next(yaku_1["default"].reject(e));
            }
            while (!(item = iter.next()).done) {
                item.value.subscribe(next, onError);
            }
        });
    };
    return Observable;
}());
exports.__esModule = true;
exports["default"] = Observable;
function genHandler(self) {
    self.next = function (val) {
        var i = 0;
        var len = self.subscribers.length;
        var subscriber;
        while (i < len) {
            subscriber = self.subscribers[i++];
            yaku_1["default"].resolve(val).then(subscriber._onNext, subscriber._onError).then(subscriber.next, subscriber._nextErr);
        }
    };
    self.error = function (err) {
        self.next(yaku_1["default"].reject(err));
    };
}
function genNextErr(next) {
    return function (reason) {
        next(yaku_1["default"].reject(reason));
    };
}
