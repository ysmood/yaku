# Overview

The `src/yaku.coffee` of Yaku is full compatible with V8's native [Promise][native], but much faster.

If you want to learn how Promise works, read the minimum implementation [docs/minPromiseA+.coffee][]. Without comments, it is only 80 lines of code.
It only implements the `constructor` and `then`. It passed all the tests of [promises-aplus-tests][].

I am not an optimization freak, I try to keep the source code readable and maintainable.
Premature optimization is the root of all evil.

[![NPM version](https://badge.fury.io/js/yaku.svg)](http://badge.fury.io/js/yaku) [![Build Status](https://travis-ci.org/ysmood/yaku.svg)](https://travis-ci.org/ysmood/yaku) [![Deps Up to Date](https://david-dm.org/ysmood/yaku.svg?style=flat)](https://david-dm.org/ysmood/yaku)

# Features

- The minified file is only 3.2KB ([Bluebird][] / 73KB, [ES6-promise][] / 18KB)
- 100% compliant with Promise/A+ specs
- Better performance than the native Promise
- Works on IE5+ and other major browsers
- Possibly unhandled rejection and long stack trace support

# Quick Start

## Node.js

```shell
npm install yaku
```

Then:
```coffee
Promise = require 'yaku'
```

## Browser

Download the `yaku.js` file from [release page][]. It supports both `AMD` and `CMD`.
Raw usage without `AMD` or `CMD`:

```html
<script type="text/javascript" src ="yaku.js"></script>
<script>
    // Yaku will be assigned to `window.Yaku`.
    Promise = Yaku
</script>
```

# Compare

These comparisons only reflect some limited truth, no one is better than than others on all aspects.

```
iojs v1.8.1
OS   darwin
Arch x64
CPU  Intel(R) Core(TM) i7-4850HQ CPU @ 2.30GHz
```

| Name            | Unit Test | 1ms async task | sync task | Helpers | file size |
| --------------- | --------- | -------------- | --------- | ------- | --------- |
| Yaku            | 872/872   | 283ms          | 68ms      | ++      | 3.2KB |
| [Bluebird][]    | 872/872   | 244ms          | 164ms     | +++++++ | 73KB      |
| [ES6-promise][] | 872/872   | 435ms          | 110ms     | +       | 18KB      |
| [native][]      | 872/872   | 816ms          | 605ms     | +       | 0KB       |
| [q][]           | 208/872   | 2637ms         | 2327ms    | +++     | 24K       |

- **Helpers**: extra methods that help with your promise programming, such as
  async flow control helpers, debug helpers.
- **1ms async task**: `npm run no -- benchmark`, the smaller the better.
- **sync task**: `npm run no -- benchmark --sync`, the smaller the better.

# API

- ### **[constructor(executor)](src/yaku.coffee?source#L23)**

    This class follows the [Promises/A+](https://promisesaplus.com) and
    [ES6](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects) spec
    with some extra helpers.

    - **<u>param</u>**: `executor` { _Function_ }

        Function object with two arguments resolve and reject.
        The first argument fulfills the promise, the second argument rejects it.
        We can call these functions, once our operation is completed.

    - **<u>example</u>**:

        ```coffee
        Promise = require 'yaku'
        p = new Promise (resolve, reject) ->
        	setTimeout ->
        		if Math.random() > 0.5
        			resolve 'ok'
        		else
        			reject 'no'
        ```

- ### **[then(onFulfilled, onRejected)](src/yaku.coffee?source#L53)**

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
        ```coffee
        Promise = require 'yaku'
        p = Promise.resolve 10

        p.then (v) ->
        	console.log v
        ```

- ### **[catch(onRejected)](src/yaku.coffee?source#L71)**

    The `catch()` method returns a Promise and deals with rejected cases only.
    It behaves the same as calling `Promise.prototype.then(undefined, onRejected)`.

    - **<u>param</u>**: `onRejected` { _Function_ }

        A Function called when the Promise is rejected.
        This function has one argument, the rejection reason.

    - **<u>return</u>**: { _Yaku_ }

        A Promise that deals with rejected cases only.

    - **<u>example</u>**:

        ```coffee
        Promise = require 'yaku'
        p = Promise.reject 10

        p.catch (v) ->
        	console.log v
        ```

- ### **[@resolve(value)](src/yaku.coffee?source#L87)**

    The `Promise.resolve(value)` method returns a Promise object that is resolved with the given value.
    If the value is a thenable (i.e. has a then method), the returned promise will "follow" that thenable,
    adopting its eventual state; otherwise the returned promise will be fulfilled with the value.

    - **<u>param</u>**: `value` { _Any_ }

        Argument to be resolved by this Promise.
        Can also be a Promise or a thenable to resolve.

    - **<u>return</u>**: { _Yaku_ }

    - **<u>example</u>**:

        ```coffee
        Promise = require 'yaku'
        p = Promise.resolve 10
        ```

- ### **[@reject(reason)](src/yaku.coffee?source#L101)**

    The `Promise.reject(reason)` method returns a Promise object that is rejected with the given reason.

    - **<u>param</u>**: `reason` { _Any_ }

        Reason why this Promise rejected.

    - **<u>return</u>**: { _Yaku_ }

    - **<u>example</u>**:

        ```coffee
        Promise = require 'yaku'
        p = Promise.reject 10
        ```

- ### **[@race(iterable)](src/yaku.coffee?source#L123)**

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

        ```coffee
        Promise = require 'yaku'
        Promise.race [
        	123
        	Promise.resolve 0
        ]
        .then (value) ->
        	console.log value # => 123
        ```

- ### **[@all(iterable)](src/yaku.coffee?source#L160)**

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

        ```coffee
        Promise = require 'yaku'
        Promise.all [
        	123
        	Promise.resolve 0
        ]
        .then (values) ->
        	console.log values # => [123, 0]
        ```

- ### **[@onUnhandledRejection(reason)](src/yaku.coffee?source#L209)**

    Catch all possibly unhandled rejections.
    If it is set, auto `console.error` unhandled rejection will be disabed.

    - **<u>param</u>**: `reason` { _Any_ }

        The rejection reason.

    - **<u>example</u>**:

        ```coffee
        Promise = require 'yaku'
        Promise.onUnhandledRejection = (reason) ->
        	console.error reason

        # The console will log an unhandled rejection error message.
        Promise.reject('my reason')

        # The below won't log the unhandled rejection error message.
        Promise.reject('v').catch ->
        ```

- ### **[@enableLongStackTrace](src/yaku.coffee?source#L234)**

    It is used to enable the long stack trace.

    - **<u>example</u>**:

        ```coffee
        Promise = require 'yaku'
        Promise.enableLongStackTrace()
        ```



# FAQ

- Better long stack trace support?

  > Latest Node.js and browsers are already support it. If you enabled it, Yaku will take advantage of it
  > without much overhead. Such as this library [longjohn][] for Node.js, or this article for [Chrome][crhome-lst].

- `catch` on old brwoser (IE7, IE8 etc)?

  > In ECMA-262 spec, `catch` cannot be used as method name. If you use `coffee-script`, it will handle the `catch` automatically, else you have to alias the method name or use something like `Promise.resolve()['catch'](function() {})` or `Promise.resolve().then(null, function() {})`.

- Will Yaku implement `done`, `finally`, `promisify`, etc?

  > No. All non-ES6 APIs are only implemented for debugging and testing, which means when you delete Yaku, everything
  > should works well with ES6 native promise. If you need fancy and magic, go for [Bluebird][].

- The name Yaku is weird?

  > The name `yaku` comes from the word `約束(yakusoku)` which means promise.

# Unit Test

This project use [promises-aplus-tests][] to test the compliance of Promise/A+ specification. There are about 900 test cases.

Use `npm run no -- test` to run the unit test.

# Benchmark

Use `npm run no -- benchmark` to run the benchmark.


[Bluebird]: https://github.com/petkaantonov/bluebird
[ES6-promise]: https://github.com/jakearchibald/es6-promise
[native]: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
[q]: https://github.com/kriskowal/q
[release page]: https://github.com/ysmood/yaku/releases
[docs/minPromiseA+.coffee]: docs/minPromiseA+.coffee
[promises-aplus-tests]: https://github.com/promises-aplus/promises-tests
[longjohn]: https://github.com/mattinsler/longjohn
[crhome-lst]: http://www.html5rocks.com/en/tutorials/developertools/async-call-stack