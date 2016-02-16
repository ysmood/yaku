<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>

# Overview

Yaku is full compatible with ES6's native [Promise][native], but much faster, and more error friendly.
If you want to learn how Promise works, read the minimum implementation [docs/minPromiseAplus.js][]. Without comments, it is only 80 lines of code (gzipped size is 0.5KB).
It only implements the `constructor` and `then`.

Yaku passed all the tests of [promises-aplus-tests][] and [promises-es6-tests][].

I am not an optimization freak, I try to keep the source code readable and maintainable.
Premature optimization is the root of all evil. I write this lib to research one of my data structure
ideas: [docs/lazyTree.md][].

[![NPM version](https://badge.fury.io/js/yaku.svg)](http://badge.fury.io/js/yaku) [![Build Status](https://travis-ci.org/ysmood/yaku.svg)](https://travis-ci.org/ysmood/yaku) [![Deps Up to Date](https://david-dm.org/ysmood/yaku.svg?style=flat)](https://david-dm.org/ysmood/yaku)



# Features

- The minified file is only 3.8KB (1.5KB gzipped) ([Bluebird][] / 73KB, [ES6-promise][] / 18KB)
- [Better "possibly unhandled rejection" and "long stack trace"][docs/debugHelperComparison.md] than [Bluebird][]
- Much better performance than the native Promise
- 100% compliant with Promises/A+ specs and nearly 100% compliant with ES6 specs
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
Raw usage without:

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

| Name                 | promises-es6-tests | 1ms async task / mem | Helpers | file size |
| -------------------- | ------------------ | -------------------- | ------- | --------- |
| Yaku v0.12           |         ✓          |  247ms / 101mb       | +++     | 3.8KB |
| [Bluebird][] v3.3    |         x          |  166ms / 86mb        | +++++++ | 73KB      |
| [ES6-promise][] v3.1 |         x          |  342ms / 104mb       | +       | 18KB      |
| [native][] v5.0      |         x          |  496ms / 166mb       | +       | 0KB       |
| [q][] v1.4           |         x          | 3109ms / 618mb       | +++     | 24K       |

- **Helpers**: extra methods that help with your promise programming, such as
  async flow control helpers, debug helpers. For more details: [docs/debugHelperComparison.md][].
- **1ms async task**: `npm run no -- benchmark`, the smaller the better.


# FAQ

- `catch` on old brwoser (IE7, IE8 etc)?

  > In ECMA-262 spec, `catch` cannot be used as method name. You have to alias the method name or use something like `Promise.resolve()['catch'](function() {})` or `Promise.resolve().then(null, function() {})`.

- Will Yaku implement `done`, `finally`, `promisify`, etc?

  > No. All non-ES6 APIs are only implemented for debugging and testing, which means when you remove Yaku, everything
  > should work well with ES6 native promise. If you need fancy and magic, go for [Bluebird][].

- When using with Babel and Regenerator, the unhandled rejection doesn't work.

  > Because Regenerator use global Promise directly and don't have an api to set the Promise lib.
  > You have to import Yaku globally to make it use Yaku: `require("yaku/lib/global");`.

- Better long stack trace support?

  > Latest Node.js and browsers are already support it. If you enabled it, Yaku will take advantage of it
  > without much overhead. Such as this library [longjohn][] for Node.js, or this article for [Chrome][crhome-lst].

- The name Yaku is weird?

  > The name `yaku` comes from the word `約束(yakusoku)` which means promise.


# Unhandled Rejection

Yaku will report any unhandled rejection via `console.error` by default, in case you forget to write `catch`.
You can catch with them manually:

- Browser: `window.onunhandledrejection = ({ promise, reason }) => { /* Your Code */ };`
- Node: `process.on("unhandledRejection", (reason, promise) => { /* Your Code */ });`

For more spec read [Unhandled Rejection Tracking Browser Events](https://github.com/domenic/unhandled-rejections-browser-spec).


# API

- #### require('yaku')
  - [Yaku(executor)](#yakuexecutor)
  - [then(onFulfilled, onRejected)](#thenonfulfilled-onrejected)
  - [catch(onRejected)](#catchonrejected)
  - [Yaku.resolve(value)](#yakuresolvevalue)
  - [Yaku.reject(reason)](#yakurejectreason)
  - [Yaku.race(iterable)](#yakuraceiterable)
  - [Yaku.all(iterable)](#yakualliterable)
  - [Yaku.Symbol](#yakusymbol)
  - [Yaku.onUnhandledRejection(reason, p)](#yakuonunhandledrejectionreason-p)
  - [Yaku.enableLongStackTrace](#yakuenablelongstacktrace)
  - [Yaku.nextTick](#yakunexttick)

- #### require('yaku/lib/utils')
  - [any(iterable)](#anyiterable)
  - [async(limit, list, saveResults, progress)](#asynclimit-list-saveresults-progress)
  - [callbackify(fn, self)](#callbackifyfn-self)
  - [Deferred](#deferred)
  - [flow(list)](#flowlist)
  - [guard(type, onRejected)](#guardtype-onrejected)
  - [if(cond, trueFn, falseFn)](#ifcond-truefn-falsefn)
  - [isPromise(obj)](#ispromiseobj)
  - [never()](#never)
  - [promisify(fn, self)](#promisifyfn-self)
  - [sleep(time, val)](#sleeptime-val)
  - [Observable](#observable)
  - [retry(countdown, fn, this)](#retrycountdown-fn-this)
  - [throw(err)](#throwerr)

- #### require('yaku/lib/Observable')
  - [Observable(executor)](#observableexecutor)
  - [emit(value)](#emitvalue)
  - [publisher](#publisher)
  - [subscribers](#subscribers)
  - [subscribe(onEmit, onError)](#subscribeonemit-onerror)
  - [unsubscribe](#unsubscribe)
  - [Observable.merge(iterable)](#observablemergeiterable)

---------------------------------------


- ### **[Yaku(executor)](src/yaku.js?source#L31)**

    This class follows the [Promises/A+](https://promisesaplus.com) and
    [ES6](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects) spec
    with some extra helpers.

    - **<u>param</u>**: `executor` { _Function_ }

        Function object with two arguments resolve, reject.
        The first argument fulfills the promise, the second argument rejects it.
        We can call these functions, once our operation is completed.

- ### **[then(onFulfilled, onRejected)](src/yaku.js?source#L76)**

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

- ### **[catch(onRejected)](src/yaku.js?source#L101)**

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
        var p = Promise.reject(new Error("ERR"));

        p['catch']((v) => {
            console.log(v);
        });
        ```

- ### **[Yaku.resolve(value)](src/yaku.js?source#L128)**

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

- ### **[Yaku.reject(reason)](src/yaku.js?source#L142)**

    The `Promise.reject(reason)` method returns a Promise object that is rejected with the given reason.

    - **<u>param</u>**: `reason` { _Any_ }

        Reason why this Promise rejected.

    - **<u>return</u>**: { _Yaku_ }

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        var p = Promise.reject(new Error("ERR"));
        ```

- ### **[Yaku.race(iterable)](src/yaku.js?source#L166)**

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

- ### **[Yaku.all(iterable)](src/yaku.js?source#L226)**

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

    - **<u>example</u>**:

        Use with iterable.
        ```js
        var Promise = require('yaku');
        Promise.all((function * () {
            yield 10;
            yield new Promise(function (r) { setTimeout(r, 1000, "OK") });
        })())
        .then((values) => {
            console.log(values); // => [123, 0]
        });
        ```

- ### **[Yaku.Symbol](src/yaku.js?source#L278)**

    The ES6 Symbol object that Yaku should use, by default it will use the
    global one.

    - **<u>type</u>**: { _Object_ }

    - **<u>example</u>**:

        ```js
        var core = require("core-js/library");
        var Promise = require("yaku");
        Promise.Symbol = core.Symbol;
        ```

- ### **[Yaku.onUnhandledRejection(reason, p)](src/yaku.js?source#L300)**

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

- ### **[Yaku.enableLongStackTrace](src/yaku.js?source#L320)**

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

- ### **[Yaku.nextTick](src/yaku.js?source#L343)**

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

It's a bundle of all the following functions. You can require them all with `var yutils = require("yaku/lib/utils")`,
or require them separately like `require("yaku/lib/flow")`. If you want to use it in the browser, you have to use `browserify` or `webpack`. You can even use another Promise lib, such as:

```js
require("yaku/lib/_").Promise = require("bluebird");
var source = require("yaku/lib/source");

// now "source" use bluebird instead of yaku.
```

- ### **[any(iterable)](src/utils.js?source#L22)**

    Similar with the `Promise.race`, but only rejects when every entry rejects.

    - **<u>param</u>**: `iterable` { _iterable_ }

        An iterable object, such as an Array.

    - **<u>return</u>**: { _Yaku_ }

    - **<u>example</u>**:

        ```js
        var any = require('yaku/lib/any');
        any([
            123,
            Promise.resolve(0),
            Promise.reject(new Error("ERR"))
        ])
        .then((value) => {
            console.log(value); // => 123
        });
        ```

- ### **[async(limit, list, saveResults, progress)](src/utils.js?source#L69)**

    A function that helps run functions under a concurrent limitation.
    To run functions sequentially, use `yaku/lib/flow`.

    - **<u>param</u>**: `limit` { _Int_ }

        The max task to run at a time. It's optional.
        Default is `Infinity`.

    - **<u>param</u>**: `list` { _Iterable_ }

        Any [iterable](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols) object. It should be a lazy iteralbe object,
        don't pass in a normal Array with promises.

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
        var async = require('yaku/lib/async');

        var urls = [
            'http://a.com',
            'http://b.com',
            'http://c.com',
            'http://d.com'
        ];
        var tasks = function * () {
            var i = 0;
            yield kit.request(url[i++]);
            yield kit.request(url[i++]);
            yield kit.request(url[i++]);
            yield kit.request(url[i++]);
        }();

        async(tasks).then(() => kit.log('all done!'));

        async(2, tasks).then(() => kit.log('max concurrent limit is 2'));

        async(3, { next: () => {
            var url = urls.pop();
            return {
                 done: !url,
                 value: url && kit.request(url)
            };
        } })
        .then(() => kit.log('all done!'));
        ```

- ### **[callbackify(fn, self)](src/utils.js?source#L78)**

    If a function returns promise, convert it to
    node callback style function.

    - **<u>param</u>**: `fn` { _Function_ }

    - **<u>param</u>**: `self` { _Any_ }

        The `this` to bind to the fn.

    - **<u>return</u>**: { _Function_ }

- ### **[Deferred](src/utils.js?source#L84)**

    **deprecate** Create a `jQuery.Deferred` like object.
    It will cause some buggy problems, please don't use it.

- ### **[flow(list)](src/utils.js?source#L142)**

    Creates a function that is the composition of the provided functions.
    See `yaku/lib/async`, if you need concurrent support.

    - **<u>param</u>**: `list` { _Iterable_ }

        Any [iterable](https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Iteration_protocols) object. It should be a lazy iteralbe object,
        don't pass in a normal Array with promises.

    - **<u>return</u>**: { _Function_ }

        `(val) -> Promise` A function that will return a promise.

    - **<u>example</u>**:

        It helps to decouple sequential pipeline code logic.
        ```js
        var kit = require('nokit');
        var flow = require('yaku/lib/flow');

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

        var download = flow(createUrl, curl, save);
        // same as "download = flow([createUrl, curl, save])"

        download('home');
        ```

    - **<u>example</u>**:

        Walk through first link of each page.
        ```js
        var kit = require('nokit');
        var flow = require('yaku/lib/flow');

        var list = [];
        function iter (url) {
            return {
                done: !url,
                value: url && kit.request(url).then((body) => {
                    list.push(body);
                    var m = body.match(/href="(.+?)"/);
                    if (m) return m[0];
                });
            };
        }

        var walker = flow(iter);
        walker('test.com');
        ```

- ### **[guard(type, onRejected)](src/utils.js?source#L171)**

    Enable a helper to catch specific error type.
    It will be directly attach to the prototype of the promise.

    - **<u>param</u>**: `type` { _class_ }

    - **<u>param</u>**: `onRejected` { _Function_ }

    - **<u>return</u>**: { _Promise_ }

        ```js
        var Promise = require('yaku');
        require('yaku/lib/guard');

        class AnError extends Error {
        }

        Promise.reject(new AnError('hey'))
        .guard(AnError, (err) => {
             // only log AnError type
             console.log(err);
        })
        .then(() => {
             console.log('done');
        })
        .guard(Error, (err) => {
             // log all error type
             console.log(err)
        });
        ```

- ### **[if(cond, trueFn, falseFn)](src/utils.js?source#L191)**

    if-else helper

    - **<u>param</u>**: `cond` { _Promise_ }

    - **<u>param</u>**: `trueFn` { _Function_ }

    - **<u>param</u>**: `falseFn` { _Function_ }

    - **<u>return</u>**: { _Promise_ }

    - **<u>example</u>**:

        ```js
        var Promise = require('yaku');
        var yutils = require('yaku/lib/utils');

        yutils.if(Promise.resolve(false), () => {
            // true
        }, () => {
            // false
        })
        ```

- ### **[isPromise(obj)](src/utils.js?source#L199)**

    **deprecate** Check if an object is a promise-like object.
    Don't use it to coercive a value to Promise, instead use `Promise.resolve`.

    - **<u>param</u>**: `obj` { _Any_ }

    - **<u>return</u>**: { _Boolean_ }

- ### **[never()](src/utils.js?source#L205)**

    Create a promise that never ends.

    - **<u>return</u>**: { _Promise_ }

        A promise that will end the current pipeline.

- ### **[promisify(fn, self)](src/utils.js?source#L234)**

    Convert a node callback style function to a function that returns
    promise when the last callback is not supplied.

    - **<u>param</u>**: `fn` { _Function_ }

    - **<u>param</u>**: `self` { _Any_ }

        The `this` to bind to the fn.

    - **<u>return</u>**: { _Function_ }

    - **<u>example</u>**:

        ```js
        var promisify = require('yaku/lib/promisify');
        function foo (val, cb) {
            setTimeout(() => {
                cb(null, val + 1);
            });
        }

        var bar = promisify(foo);

        bar(0).then((val) => {
            console.log val // output => 1
        });

        // It also supports the callback style.
        bar(0, (err, val) => {
            console.log(val); // output => 1
        });
        ```

- ### **[sleep(time, val)](src/utils.js?source#L247)**

    Create a promise that will wait for a while before resolution.

    - **<u>param</u>**: `time` { _Integer_ }

        The unit is millisecond.

    - **<u>param</u>**: `val` { _Any_ }

        What the value this promise will resolve.

    - **<u>return</u>**: { _Promise_ }

    - **<u>example</u>**:

        ```js
        var sleep = require('yaku/lib/sleep');
        sleep(1000).then(() => console.log('after one second'));
        ```

- ### **[Observable](src/utils.js?source#L253)**

    Read the `Observable` section.

    - **<u>type</u>**: { _Function_ }

- ### **[retry(countdown, fn, this)](src/utils.js?source#L302)**

    Retry a function until it resolves before a mount of times, or reject with all
    the error states.

    - **<u>version_added</u>**:

        v0.7.10

    - **<u>param</u>**: `countdown` { _Number | Function_ }

        How many times to retry before rejection.
        When it's a function `(errs) => Boolean | Promise.resolve(Boolean)`,
        you can use it to create complex countdown logic,
        it can even return a promise to create async countdown logic.

    - **<u>param</u>**: `fn` { _Function_ }

        The function can return a promise or not.

    - **<u>param</u>**: `this` { _Any_ }

        Optional. The context to call the function.

    - **<u>return</u>**: { _Function_ }

        The wrapped function. The function will reject an array
        of reasons that throwed by each try.

    - **<u>example</u>**:

        Retry 3 times before rejection.
        ```js
        var retry = require('yaku/lib/retry');
        var { request } = require('nokit');

        retry(3, request)('http://test.com').then(
           (body) => console.log(body),
           (errs) => console.error(errs)
        );
        ```

    - **<u>example</u>**:

        Here a more complex retry usage, it shows an random exponential backoff algorithm to
        wait and retry again, which means the 10th attempt may take 10 minutes to happen.
        ```js
        var retry = require('yaku/lib/retry');
        var sleep = require('yaku/lib/sleep');
        var { request } = require('nokit');

        function countdown (retries) {
           var attempt = 0;
           return async () => {
                var r = Math.random() * Math.pow(2, attempt) * 1000;
                var t = Math.min(r, 1000 * 60 * 10);
                await sleep(t);
                return attempt++ < retries;
           };
        }

        retry(countdown(10), request)('http://test.com').then(
           (body) => console.log(body),
           (errs) => console.error(errs)
        );
        ```

- ### **[throw(err)](src/utils.js?source#L316)**

    Throw an error to break the program.

    - **<u>param</u>**: `err` { _Any_ }

    - **<u>example</u>**:

        ```js
        var ythrow = require('yaku/lib/throw');
        Promise.resolve().then(() => {
            // This error won't be caught by promise.
            ythrow('break the program!');
        });
        ```




# Observable

- ### **[Observable(executor)](src/Observable.js?source#L59)**

    Create a composable observable object.
    Promise can't resolve multiple times, this function makes it possible, so
    that you can easily map, filter and even back pressure events in a promise way.
    For real world example: [Double Click Demo](https://jsbin.com/niwuti/edit?html,js,output).

    - **<u>version_added</u>**:

        v0.7.2

    - **<u>param</u>**: `executor` { _Function_ }

        `(emit) ->` It's optional.

    - **<u>return</u>**: { _Observable_ }

    - **<u>example</u>**:

        ```js
        var Observable = require("yaku/lib/Observable");
        var linear = new Observable();

        var x = 0;
        setInterval(linear.emit, 1000, x++);

        // Wait for a moment then emit the value.
        var quad = linear.subscribe(async x => {
            await sleep(2000);
            return x * x;
        });

        var another = linear.subscribe(x => -x);

        quad.subscribe(
            value => { console.log(value); },
            reason => { console.error(reason); }
        );

        // Emit error
        linear.emit(Promise.reject(new Error("reason")));

        // Unsubscribe a observable.
        quad.unsubscribe();

        // Unsubscribe all subscribers.
        linear.subscribers = [];
        ```

    - **<u>example</u>**:

        Use it with DOM.
        ```js
        var filter = fn => v => fn(v) ? v : new Promise(() => {});

        var keyup = new Observable((emit) => {
            document.querySelector('input').onkeyup = emit;
        });

        var keyupText = keyup.subscribe(e => e.target.value);

        // Now we only get the input when the text length is greater than 3.
        var keyupTextGT3 = keyupText.subscribe(filter(text => text.length > 3));

        keyupTextGT3.subscribe(v => console.log(v));
        ```

- ### **[emit(value)](src/Observable.js?source#L77)**

    Emit a value.

    - **<u>param</u>**: `value` { _Any_ }

        If you want to emit a plain error, you should
        emit a rejected promise, such as `emit(Promise.reject(new Error('my error')))`,
        so that the event will go to `onError` callback.

- ### **[publisher](src/Observable.js?source#L83)**

    The publisher observable of this.

    - **<u>type</u>**: { _Observable_ }

- ### **[subscribers](src/Observable.js?source#L89)**

    All the subscribers subscribed this observable.

    - **<u>type</u>**: { _Array_ }

- ### **[subscribe(onEmit, onError)](src/Observable.js?source#L97)**

    It will create a new Observable, like promise.

    - **<u>param</u>**: `onEmit` { _Function_ }

    - **<u>param</u>**: `onError` { _Function_ }

    - **<u>return</u>**: { _Observable_ }

- ### **[unsubscribe](src/Observable.js?source#L112)**

    Unsubscribe this.

- ### **[Observable.merge(iterable)](src/Observable.js?source#L163)**

    Merge multiple observables into one.

    - **<u>version_added</u>**:

        0.9.6

    - **<u>param</u>**: `iterable` { _Iterable_ }

    - **<u>return</u>**: { _Observable_ }

    - **<u>example</u>**:

        ```js
        var Observable = require("yaku/lib/Observable");
        var sleep = require("yaku/lib/sleep");

        var src = new Observable(emit => setInterval(emit, 1000, 0));

        var a = src.subscribe(v => v + 1; });
        var b = src.subscribe((v) => sleep(10, v + 2));

        var out = Observable.merge([a, b]);

        out.subscribe((v) => {
            console.log(v);
        })
        ```





# Unit Test

This project use [promises-aplus-tests][] to test the compliance of Promises/A+ specification. There are about 900 test cases.

Use `npm run no -- test` to run the unit test.



# Benchmark

Use `npm run no -- benchmark` to run the benchmark.



# Contribute

Other than use `gulp`, all my projects use [nokit][] to deal with automation.
Run `npm run no -- -h` to print all the tasks that defined in the [nofile.js][].
If you installed `nokit` globally, you can just run `no -h` without `npm run` and `--`.


[docs/lazyTree.md]: docs/lazyTree.md
[docs/debugHelperComparison.md]: docs/debugHelperComparison.md
[Bluebird]: https://github.com/petkaantonov/bluebird
[ES6-promise]: https://github.com/jakearchibald/es6-promise
[native]: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
[q]: https://github.com/kriskowal/q
[release page]: https://github.com/ysmood/yaku/releases
[docs/minPromiseAplus.js]: docs/minPromiseAplus.js
[promises-aplus-tests]: https://github.com/promises-aplus/promises-tests
[promises-es6-tests]: https://github.com/promises-es6/promises-es6
[longjohn]: https://github.com/mattinsler/longjohn
[crhome-lst]: http://www.html5rocks.com/en/tutorials/developertools/async-call-stack
[Browserify]: http://browserify.org
[Webpack]: http://webpack.github.io/
[nokit]: https://github.com/ysmood/nokit
[nofile.js]: nofile.js