"use strict";

var Promise = require("./yaku");

/**
 * Create a composable event source function.
 * Promise can't resolve multiple times, this function makes it possible, so
 * that you can easily map, filter and debounce events in a promise way.
 * For real world example: [Double Click Demo](https://jsfiddle.net/ysmood/musds0sv/).
 * @param {Function} executor `(emit) ->` It's optional.
 * @return {Function} `(onEmit, onError) ->` The fucntion's
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
var source = function (executor) {
    function src (onEmit, onError) {
        var nextSrc = source();
        nextSrc.onEmit = onEmit;
        nextSrc.onError = onError;
        nextSrc.nextSrcErr = function (reason) {
            nextSrc.emit(Promise.reject(reason));
        };

        src.children.push(nextSrc);

        return nextSrc;
    }

    src.emit = function (val) {
        src.value = val = Promise.resolve(val);
        var i = 0, len = src.children.length, child;
        while (i < len) {
            child = src.children[i++];
            val.then(
                child.onEmit,
                child.onError
            ).then(
                child.emit,
                child.nextSrcErr
            );
        }
    };

    src.children = [];
    src.value = Promise.resolve();

    executor && executor(src.emit);

    return src;
};

module.exports = source;
