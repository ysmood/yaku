var _ = require("./_");
var genIterator = require("./genIterator");

/**
 * Create a composable observable object.
 * Promise can't resolve multiple times, this function makes it possible, so
 * that you can easily map, filter and even back pressure events in a promise way.
 * For real world example: [Double Click Demo](https://jsfiddle.net/ysmood/musds0sv/).
 * @version_added v0.7.2
 * @param {Function} executor `(emit) ->` It's optional.
 * @return {Observable}
 * @example
 * ```js
 * var Observable = require("yaku/lib/Observable");
 * var linear = new Observable();
 *
 * var x = 0;
 * setInterval(linear.emit, 1000, x++);
 *
 * // Wait for a moment then emit the value.
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
 * linear.emit(Promise.reject(new Error("reason")));
 *
 * // Unsubscribe a observable.
 * quad.unsubscribe();
 *
 * // Unsubscribe all children.
 * linear.children = [];
 * ```
 * @example
 * Use it with DOM.
 * ```js
 * var filter = fn => v => fn(v) ? v : new Promise(() => {});
 *
 * var keyup = new Observable((emit) => {
 *     document.querySelector('input').onkeyup = emit;
 * });
 *
 * var keyupText = keyup.subscribe(e => e.target.value);
 *
 * // Now we only get the input when the text length is greater than 3.
 * var keyupTextGT3 = keyupText.subscribe(filter(text => text.length > 3));
 *
 * keyupTextGT3.subscribe(v => console.log(v));
 * ```
 * @example
 * Merge two sources into one.
 * ```js
 * let one = new Observable(emit => setInterval(emit, 100, 'one'));
 * let two = new Observable(emit => setInterval(emit, 200, 'two'));
 * let merge = list => new Observable(
 *      (emit) => list.forEach(o => o.subscribe(emit))
 * );
 *
 * let three = merge([one, two]);
 * three.subscribe(v => console.log(v));
 * ```
 */
var Observable = module.exports = function Observable (executor) {
    var self = this
    , emit = genEmit(self);

    self.children = [];

    executor && executor(emit);
};

_.extendPrototype(Observable, {

    /**
     * Emit a value.
     * @param  {Any} value
     */
    emit: null,

    /**
     * The parent observable of this.
     * @type {Observable}
     */
    parent: null,

    /**
     * All the children subscribed this observable.
     * @type {Array}
     */
    children: null,

    /**
     * It will create a new Observable, like promise.
     * @param  {Function} onEmit
     * @param  {Function} onError
     * @return {Observable}
     */
    subscribe: function (onEmit, onError) {
        var self = this, child = new Observable();
        child._onEmit = onEmit;
        child._onError = onError;
        child._nextErr = genNextErr(child.emit);

        child.parent = self;
        self.children.push(child);

        return child;
    },

    /**
     * Unsubscribe this.
     */
    unsubscribe: function () {
        var parent = this.parent;
        parent && parent.children.splice(parent.children.indexOf(this), 1);
    }

});

function genEmit (self) {
    return self.emit = function (val) {
        var i = 0, len = self.children.length, child;
        while (i < len) {
            child = self.children[i++];
            _.Promise.resolve(val).then(
                child._onEmit,
                child._onError
            ).then(
                child.emit,
                child._nextErr
            );
        }
    };
}

function genNextErr (emit) {
    return function (reason) {
        emit(_.Promise.reject(reason));
    };
}

/**
 * Merge multiple observables into one.
 * @param  {Iterable} iterable
 * @return {Observable}
 * @example
 * ```js
 * var Observable = require("yaku/lib/Observable");
 * var sleep = require("yaku/lib/sleep");
 *
 * var src = new Observable(function (emit) {
 *     setInterval(emit, 1000, 0);
 * });
 *
 * var a = src.subscribe(function (v) { return v + 1; });
 * var b = src.subscribe(function (v) {
 *     return sleep(10, v + 2);
 * });
 *
 * var out = Observable.all([a, b]);
 *
 * out.subscribe(function (arr) {
 *     console.log(arr);
 * })
 * ```
 */
Observable.all = function all (iterable) {
    var iter = genIterator(iterable);

    return new Observable(function (emit) {
        var result = [], len = iterable.length, item;

        function onEmit (v) {
            result.push(v);

            if (result.length === len) {
                emit(result);
                result = [];
            }
        }

        function onError (e) {
            emit(_.Promise.reject(e));
            result = [];
        }

        while (!(item = iter.next()).done) {
            item.value.subscribe(onEmit, onError);
        }
    });
};
