import _ from "./_";
import genIterator from "./genIterator";
var Promise = _.Promise;

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
export default class Observable {
    constructor (executor?: Function) {
        var self = this;

        genHandler(self);

        self.subscribers = [];

        executor && executor(self.next, self.error);
    };

    /**
     * Emit a value.
     * @param  {Any} value
     * so that the event will go to `onError` callback.
     */
    next: any = null

    /**
     * Emit an error.
     * @param  {Any} value
     */
    error: any = null

    /**
     * The publisher observable of this.
     * @type {Observable}
     */
    publisher: Observable = null

    /**
     * All the subscribers subscribed this observable.
     * @type {Array}
     */
    subscribers: Observable[] = null

    /**
     * It will create a new Observable, like promise.
     * @param  {Function} onNext
     * @param  {Function} onError
     * @return {Observable}
     */
    subscribe(onNext, onError) {
        var self = this;
        var subscriber = new Observable();
        subscriber._onNext = onNext;
        subscriber._onError = onError;
        subscriber._nextErr = genNextErr(subscriber.next);

        subscriber.publisher = self;
        self.subscribers.push(subscriber);

        return subscriber;
    }

    /**
     * Unsubscribe this.
     */
    unsubscribe() {
        var publisher = this.publisher;
        publisher && publisher.subscribers.splice(publisher.subscribers.indexOf(this), 1);
    }

    private _onNext: Function
    private _onError: Function
    private _nextErr: Function

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
    static merge<T> (iterable: Iterable<T>) {
        var iter = genIterator(iterable);
        return new Observable(next => {
            var item;

            function onError (e) {
                next(Promise.reject(e));
            }

            while (!(item = iter.next()).done) {
                item.value.subscribe(next, onError);
            }
        });
    }
}

function genHandler (self) {
    self.next = val => {
        var i = 0;
        var len = self.subscribers.length;
        var subscriber;
        while (i < len) {
            subscriber = self.subscribers[i++];
            Promise.resolve(val).then(
                subscriber._onNext,
                subscriber._onError
            ).then(
                subscriber.next,
                subscriber._nextErr
            );
        }
    };

    self.error = err => {
        self.next(Promise.reject(err));
    };
}

function genNextErr (next) {
    return reason => {
        next(Promise.reject(reason));
    };
}

