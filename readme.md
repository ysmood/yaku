<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>

# Overview

Yaku is full compatible with ES6's native [Promise][native], but much faster, and more error friendly.
If you want to learn how Promise works, read the minimum implementation [docs/minPromiseA+.coffee][]. Without comments, it is only 80 lines of code (gzipped size is 0.5KB).
It only implements the `constructor` and `then`. It passed all the tests of [promises-aplus-tests][].

I am not an optimization freak, I try to keep the source code readable and maintainable.
Premature optimization is the root of all evil. I write this lib to research one of my data structure
ideas: [docs/lazyTree.md][].

[![NPM version](https://badge.fury.io/js/yaku.svg)](http://badge.fury.io/js/yaku) [![Build Status](https://travis-ci.org/ysmood/yaku.svg)](https://travis-ci.org/ysmood/yaku) [![Deps Up to Date](https://david-dm.org/ysmood/yaku.svg?style=flat)](https://david-dm.org/ysmood/yaku)

# Features

- The minified file is only 3.3KB (1.5KB gzipped) ([Bluebird][] / 73KB, [ES6-promise][] / 18KB)
- [Better "possibly unhandled rejection" and "long stack trace"][docs/debugHelperComparison.md] than [Bluebird][]
- Much better performance than the native Promise
- 100% compliant with Promises/A+ specs and ES6
- Designed to work on IE5+ and other major browsers
- Well commented source code with every Promises/A+ spec

# Quick Start

## Node.js

```shell
npm install yaku
```

Then:
```js
var Promise = require('yaku');
```

## Browser

Use something like [Browserify][] or [Webpack][], or download the `yaku.js` file from [release page][].
It supports both `AMD`, `CMD` and `CommonJS`. Raw usage without `AMD`, `CMD` or `CommonJS`:

```html
<script type="text/javascript" src ="yaku.js"></script>
<script>
    // Yaku will be assigned to `window.Yaku`.
    var Promise = Yaku;
</script>
```

# Change Log

[docs/changelog.md](docs/changelog.md)

# Compare to Other Promise Libs

These comparisons only reflect some limited truth, no one is better than all others on all aspects.
For more details see the [benchmark/readme.md](benchmark/readme.md). There are tons of Promises/A+ implementations, you can see them [here](https://promisesaplus.com/implementations). Only some of the famous ones were tested.

| Name                 | 1ms async task / mem | sync task / mem | Helpers | file size |
| -------------------- | -------------------- | --------------- | ------- | --------- |
| Yaku                 |  257ms / 110MB       |  126ms / 80MB   | +++     | 3.3KB |
| [Bluebird][] v2.9    |  249ms / 102MB       |  155ms / 80MB   | +++++++ | 73KB      |
| [ES6-promise][] v2.3 |  427ms / 120MB       |   92ms / 78MB   | +       | 18KB      |
| [native][] iojs v1.8 |  789ms / 189MB       |  605ms / 147MB  | +       | 0KB       |
| [q][] v1.3           | 2648ms / 646MB       | 2373ms / 580MB  | +++     | 24K       |

- **Helpers**: extra methods that help with your promise programming, such as
  async flow control helpers, debug helpers. For more details: [docs/debugHelperComparison.md][].
- **1ms async task**: `npm run no -- benchmark`, the smaller the better.
- **sync task**: `npm run no -- benchmark --sync`, the smaller the better.

# FAQ

- `catch` on old brwoser (IE7, IE8 etc)?

  > In ECMA-262 spec, `catch` cannot be used as method name. You have to alias the method name or use something like `Promise.resolve()['catch'](function() {})` or `Promise.resolve().then(null, function() {})`.

- Will Yaku implement `done`, `finally`, `promisify`, etc?

  > No. All non-ES6 APIs are only implemented for debugging and testing, which means when you remove Yaku, everything
  > should work well with ES6 native promise. If you need fancy and magic, go for [Bluebird][].

- How to use it with Babel?

  > Fairly easy, with node `global.Promise = require("yaku");`, with browser `window.Promise = require("yaku");`.

- Better long stack trace support?

  > Latest Node.js and browsers are already support it. If you enabled it, Yaku will take advantage of it
  > without much overhead. Such as this library [longjohn][] for Node.js, or this article for [Chrome][crhome-lst].

- The name Yaku is weird?

  > The name `yaku` comes from the word `約束(yakusoku)` which means promise.

# API

- ### **[Yaku(executor)](src/yaku.js?source#L70)**

    This class follows the [Promises/A+](https://promisesaplus.com) and
    [ES6](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects) spec
    with some extra helpers.

    - **<u>param</u>**: `executor` { _Function_ }

        Function object with three arguments resolve, reject and
        the promise itself.
        The first argument fulfills the promise, the second argument rejects it.
        We can call these functions, once our operation is completed.
        The `this` context of the executor is the promise itself, it can be used to add custom handlers,
        such as `abort` or `progress` helpers.

    - **<u>example</u>**:

        Here's an abort example.
        ```js
        var Promise = require('yaku');
        var p = new Promise((resolve, reject) => {
            var tmr = setTimeout(resolve, 3000);
            this.abort = (reason) => {
                clearTimeout(tmr);
                reject(reason);
            };
        });

        p.abort(new Error('abort'));
        ```

    - **<u>example</u>**:

        Here's a progress example.
        ```js
        var Promise = require('yaku');
        var p = new Promise((resolve, reject) => {
            var self = this;
            var count = 0;
            var all = 100;
            var tmr = setInterval(() => {
                try {
                    self.progress && self.progress(count, all);
                } catch (err) {
                    reject(err);
                }

                if (count < all)
                    count++;
                else {
                    resolve();
                    clearInterval(tmr);
                }
            }, 1000);
        });

        p.progress = (curr, all) => {
            console.log(curr, '/', all);
        };
        ```

- ### **[then(onFulfilled, onRejected)](src/yaku.js?source#L105)**

    Appends fulfillment and rejection handlers to the promise,
    and returns a new promise resolving to the return value of the called handler.

    - **<u>param</u>**: `onFulfilled` { _Function_ }

        Optional. Called when the Promise is resolved.

    - **<u>param</u>**: `onRejected` { _Function_ }

        Optional. Called when the Promise is rejected.

    - **<u>return</u>**: { _Yaku_ }

        It will return a new Yaku which will resolve or reject after

    - **<u>example</u>**:

        the current Promise.
        ```js
        var Promise = require('yaku');
        var p = Promise.resolve(10);

        p.then((v) => {
            console.log(v);
        });
        ```

- ### **[catch(onRejected)](src/yaku.js?source#L125)**

    The `catch()` method returns a Promise and deals with rejected cases only.
    It behaves the same as calling `Promise.prototype.then(undefined, onRejected)`.

    - **<u>param</u>**: `onRejected` { _Function_ }

        A Function called when the Promise is rejected.
        This function has one argument, the rejection reason.

    - **<u>return</u>**: { _Yaku_ }

        A Promise that deals with rejected cases only.

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        var p = Promise.reject(10);

        p['catch']((v) => {
            console.log(v);
        });
        ```

- ### **[Yaku.resolve(value)](src/yaku.js?source#L155)**

    The `Promise.resolve(value)` method returns a Promise object that is resolved with the given value.
    If the value is a thenable (i.e. has a then method), the returned promise will "follow" that thenable,
    adopting its eventual state; otherwise the returned promise will be fulfilled with the value.

    - **<u>param</u>**: `value` { _Any_ }

        Argument to be resolved by this Promise.
        Can also be a Promise or a thenable to resolve.

    - **<u>return</u>**: { _Yaku_ }

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        var p = Promise.resolve(10);
        ```

- ### **[Yaku.reject(reason)](src/yaku.js?source#L169)**

    The `Promise.reject(reason)` method returns a Promise object that is rejected with the given reason.

    - **<u>param</u>**: `reason` { _Any_ }

        Reason why this Promise rejected.

    - **<u>return</u>**: { _Yaku_ }

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        var p = Promise.reject(10);
        ```

- ### **[Yaku.race(iterable)](src/yaku.js?source#L193)**

    The `Promise.race(iterable)` method returns a promise that resolves or rejects
    as soon as one of the promises in the iterable resolves or rejects,
    with the value or reason from that promise.

    - **<u>param</u>**: `iterable` { _iterable_ }

        An iterable object, such as an Array.

    - **<u>return</u>**: { _Yaku_ }

        The race function returns a Promise that is settled
        the same way as the first passed promise to settle.
        It resolves or rejects, whichever happens first.

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        Promise.race([
            123,
            Promise.resolve(0)
        ])
        .then((value) => {
            console.log(value); // => 123
        });
        ```

- ### **[Yaku.all(iterable)](src/yaku.js?source#L232)**

    The `Promise.all(iterable)` method returns a promise that resolves when
    all of the promises in the iterable argument have resolved.

    The result is passed as an array of values from all the promises.
    If something passed in the iterable array is not a promise,
    it's converted to one by Promise.resolve. If any of the passed in promises rejects,
    the all Promise immediately rejects with the value of the promise that rejected,
    discarding all the other promises whether or not they have resolved.

    - **<u>param</u>**: `iterable` { _iterable_ }

        An iterable object, such as an Array.

    - **<u>return</u>**: { _Yaku_ }

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        Promise.all([
            123,
            Promise.resolve(0)
        ])
        .then((values) => {
            console.log(values); // => [123, 0]
        });
        ```

- ### **[Yaku.onUnhandledRejection(reason, p)](src/yaku.js?source#L281)**

    Catch all possibly unhandled rejections. If you want to use specific
    format to display the error stack, overwrite it.
    If it is set, auto `console.error` unhandled rejection will be disabled.

    - **<u>param</u>**: `reason` { _Any_ }

        The rejection reason.

    - **<u>param</u>**: `p` { _Yaku_ }

        The promise that was rejected.

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        Promise.onUnhandledRejection = (reason) => {
            console.error(reason);
        };

        // The console will log an unhandled rejection error message.
        Promise.reject('my reason');

        // The below won't log the unhandled rejection error message.
        Promise.reject('v').catch(() => {});
        ```

- ### **[Yaku.enableLongStackTrace](src/yaku.js?source#L300)**

    It is used to enable the long stack trace.
    Once it is enabled, it can't be reverted.
    While it is very helpful in development and testing environments,
    it is not recommended to use it in production. It will slow down your
    application and waste your memory.

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        Promise.enableLongStackTrace();
        ```

- ### **[Yaku.nextTick](src/yaku.js?source#L323)**

    Only Node has `process.nextTick` function. For browser there are
    so many ways to polyfill it. Yaku won't do it for you, instead you
    can choose what you prefer. For example, this project
    [setImmediate](https://github.com/YuzuJS/setImmediate).
    By default, Yaku will use `process.nextTick` on Node, `setTimeout` on browser.

    - **<u>type</u>**: { _Function_ }

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        Promise.nextTick = fn => window.setImmediate(fn);
        ```

    - **<u>example</u>**:

        You can even use sync resolution if you really know what you are doing.
        ```js
        var Promise = require('yaku');
        Promise.nextTick = fn => fn();
        ```



# Utils

To use it you have to require it separately: `var yutils = require("yaku/lib/utils")`.
If you want to use it in the browser, you have to use `browserify` or `webpack`.

- ### **[async(limit, list, saveResults, progress)](src/utils.coffee?source#L63)**

    An throttled version of `Promise.all`, it runs all the tasks under
    a concurrent limitation.
    To run tasks sequentially, use `utils.flow`.

    - **<u>param</u>**: `limit` { _Int_ }

        The max task to run at a time. It's optional.
        Default is `Infinity`.

    - **<u>param</u>**: `list` { _Array | Function_ }

        If the list is an array, it should be a list of functions or promises,
        and each function will return a promise.
        If the list is a function, it should be a iterator that returns
        a promise, when it returns `utils.end`, the iteration ends. Of course
        it can never end.

    - **<u>param</u>**: `saveResults` { _Boolean_ }

        Whether to save each promise's result or
        not. Default is true.

    - **<u>param</u>**: `progress` { _Function_ }

        If a task ends, the resolved value will be
        passed to this function.

    - **<u>return</u>**: { _Promise_ }

    - **<u>example</u>**:

        ```js
        var kit = require('nokit');
        var utils = require('yaku/lib/utils');

        var urls = [
         'http://a.com',
         'http://b.com',
         'http://c.com',
         'http://d.com'
        ];
        var tasks = [
         () => kit.request(url[0]),
         () => kit.request(url[1]),
         () => kit.request(url[2]),
         () => kit.request(url[3])
        ];

        utils.async(tasks).then(() => kit.log('all done!'));

        utils.async(2, tasks).then(() => kit.log('max concurrent limit is 2'));

        utils.async(3, () => {
         var url = urls.pop();
         if (url)
             return kit.request(url);
         else
             return utils.end;
        })
        .then(() => kit.log('all done!'));
        ```

- ### **[callbackify(fn, self)](src/utils.coffee?source#L137)**

    If a function returns promise, convert it to
    node callback style function.

    - **<u>param</u>**: `fn` { _Function_ }

    - **<u>param</u>**: `self` { _Any_ }

        The `this` to bind to the fn.

    - **<u>return</u>**: { _Function_ }

- ### **[Deferred](src/utils.coffee?source#L159)**

    Create a `jQuery.Deferred` like object.

- ### **[end()](src/utils.coffee?source#L172)**

    The end symbol.

    - **<u>return</u>**: { _Promise_ }

        A promise that will end the current pipeline.

- ### **[flow(fns)](src/utils.coffee?source#L234)**

    Creates a function that is the composition of the provided functions.
    Besides, it can also accept async function that returns promise.
    See `utils.async`, if you need concurrent support.

    - **<u>param</u>**: `fns` { _Function | Array_ }

        Functions that return
        promise or any value.
        And the array can also contains promises or values other than function.
        If there's only one argument and it's a function, it will be treated as an iterator,
        when it returns `utils.end`, the iteration ends.

    - **<u>return</u>**: { _Function_ }

        `(val) -> Promise` A function that will return a promise.

    - **<u>example</u>**:

        It helps to decouple sequential pipeline code logic.
        ```js
        var kit = require('nokit');
        var utils = require('yaku/lib/utils');

        function createUrl (name) {
        	return "http://test.com/" + name;
        }

        function curl (url) {
        	return kit.request(url).then((body) => {
        		kit.log('get');
        		return body;
        	});
        }

        function save (str) {
        	kit.outputFile('a.txt', str).then(() => {
        		kit.log('saved');
        	});
        }

        var download = utils.flow(createUrl, curl, save);
        // same as "download = utils.flow([createUrl, curl, save])"

        download('home');
        ```

    - **<u>example</u>**:

        Walk through first link of each page.
        ```js
        var kit = require('nokit');
        var utils = require('yaku/lib/utils');

        var list = [];
        function iter (url) {
        	if (!url) return utils.end;

        	return kit.request(url)
        	.then((body) => {
        		list.push(body);
        		var m = body.match(/href="(.+?)"/);
        		if (m) return m[0];
        	});
        }

        var walker = utils.flow(iter);
        walker('test.com');
        ```

- ### **[isPromise(obj)](src/utils.coffee?source#L275)**

    Check if an object is a promise-like object.

    - **<u>param</u>**: `obj` { _Any_ }

    - **<u>return</u>**: { _Boolean_ }

- ### **[promisify(fn, self)](src/utils.coffee?source#L304)**

    Convert a node callback style function to a function that returns
    promise when the last callback is not supplied.

    - **<u>param</u>**: `fn` { _Function_ }

    - **<u>param</u>**: `self` { _Any_ }

        The `this` to bind to the fn.

    - **<u>return</u>**: { _Function_ }

    - **<u>example</u>**:

        ```js
        function foo (val, cb) {
        	setTimeout(() => {
        		cb(null, val + 1);
        	});
        }

        var bar = utils.promisify(foo);

        bar(0).then((val) => {
        	console.log val // output => 1
        });

        // It also supports the callback style.
        bar(0, (err, val) => {
        	console.log(val); // output => 1
        });
        ```

- ### **[sleep(time, val)](src/utils.coffee?source#L327)**

    Create a promise that will wait for a while before resolution.

    - **<u>param</u>**: `time` { _Integer_ }

        The unit is millisecond.

    - **<u>param</u>**: `val` { _Any_ }

        What the value this promise will resolve.

    - **<u>return</u>**: { _Promise_ }

    - **<u>example</u>**:

        ```js
        utils.sleep(1000).then(() => console.log('after one second'));
        ```

- ### **[throw(err)](src/utils.coffee?source#L342)**

    Throw an error to break the program.

    - **<u>param</u>**: `err` { _Any_ }

    - **<u>example</u>**:

        ```js
        Promise.resolve().then(() => {
        	// This error won't be caught by promise.
        	utils.throw('break the program!');
        });
        ```



# Source

To use it you have to require it separately: `var ysource = require("yaku/lib/source")`.

- ### **[source(executor)](src/source.js?source#L83)**

    Create a composable event source function.
    Promise can't resolve multiple times, this function makes it possible, so
    that you can easily map, filter and debounce events in a promise way.
    For real world example: [Double Click Demo](https://jsfiddle.net/ysmood/musds0sv/).

    - **<u>param</u>**: `executor` { _Function_ }

        `(emit) ->` It's optional.

    - **<u>return</u>**: { _Function_ }

        `(onEmit, onError) ->` The function's
        members:
        ```js
        {
            emit: (value) => { /* ... */ },

            // Get current value from it.
            value: Promise,

            // All the children spawned from current source.
            children: Array
        }
        ```

    - **<u>example</u>**:

        ```js
        var source = require("yaku/lib/source");
        var linear = source();

        var x = 0;
        setInterval(() => {
            linear.emit(x++);
        }, 1000);

        // Wait for a moment then emit the value.
        var quad = linear(async x => {
            await sleep(2000);
            return x * x;
        });

        var another = linear(x => -x);

        quad(
            value => { console.log(value); },
            reason => { console.error(reason); }
        );

        // Emit error
        linear.emit(Promise.reject("reason"));

        // Dispose a specific source.
        linear.children.splice(linear.children.indexOf(quad));

        // Dispose all children.
        linear.children = [];
        ```

    - **<u>example</u>**:

        Use it with DOM.
        ```js
        var filter = fn => v => fn(v) ? v : new Promise(() => {});

        var keyup = source((emit) => {
            document.querySelector('input').onkeyup = emit;
        });

        var keyupText = keyup(e => e.target.value);

        // Now we only get the input when the text length is greater than 3.
        var keyupTextGT3 = keyupText(filter(text => text.length > 3));

        keyupTextGT3(v => console.log(v));
        ```

    - **<u>example</u>**:

        Merge two sources into one.
        ```js
        let one = source(emit => setInterval(emit, 100, 'one'));
        let two = source(emit => setInterval(emit, 200, 'two'));
        let merge = arr => arr.forEach(src => src(emit));

        let three = merge([one, two]);
        three(v => console.log(v));
        ```



# Unit Test

This project use [promises-aplus-tests][] to test the compliance of Promises/A+ specification. There are about 900 test cases.

Use `npm run no -- test` to run the unit test.

# Benchmark

Use `npm run no -- benchmark` to run the benchmark.

# Contribute

Other than use `gulp`, all my projects use [nokit][] to deal with automation.
Run `npm run no -- -h` to print all the tasks that defined in the [nofile.coffee][].
If you installed `nokit` globally, you can just run `no -h` without `npm run` and `--`.


[docs/lazyTree.md]: docs/lazyTree.md
[docs/debugHelperComparison.md]: docs/debugHelperComparison.md
[Bluebird]: https://github.com/petkaantonov/bluebird
[ES6-promise]: https://github.com/jakearchibald/es6-promise
[native]: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
[q]: https://github.com/kriskowal/q
[release page]: https://github.com/ysmood/yaku/releases
[docs/minPromiseA+.coffee]: docs/minPromiseA+.coffee
[promises-aplus-tests]: https://github.com/promises-aplus/promises-tests
[longjohn]: https://github.com/mattinsler/longjohn
[crhome-lst]: http://www.html5rocks.com/en/tutorials/developertools/async-call-stack
[Browserify]: http://browserify.org
[Webpack]: http://webpack.github.io/
[CoffeeScript]: http://coffeescript.org/
[nokit]: https://github.com/ysmood/nokit
[nofile.coffee]: nofile.coffee