<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>

# Overview

Yaku is full compatible with ES6's native [Promise][native], but much faster.

If you want to learn how Promise works, read the minimum implementation [docs/minPromiseA+.coffee][]. Without comments, it is only 80 lines of code.
It only implements the `constructor` and `then`. It passed all the tests of [promises-aplus-tests][].

I am not an optimization freak, I try to keep the source code readable and maintainable.
Premature optimization is the root of all evil. I write this lib to research one of my data structure
ideas: [docs/lazyTree.md][].

[![NPM version](https://badge.fury.io/js/yaku.svg)](http://badge.fury.io/js/yaku) [![Build Status](https://travis-ci.org/ysmood/yaku.svg)](https://travis-ci.org/ysmood/yaku) [![Deps Up to Date](https://david-dm.org/ysmood/yaku.svg?style=flat)](https://david-dm.org/ysmood/yaku)

# Features

- The minified file is only 3.8KB ([Bluebird][] / 73KB, [ES6-promise][] / 18KB)
- 100% compliant with Promise/A+ specs
- Better performance than the native Promise
- Designed to work on IE5+ and other major browsers
- [Better][docs/debugHelperComparison.md] `possibly unhandled rejection` and `long stack trace` than [Bluebird][]
- Well commented source code with every Promise/A+ spec

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

Use something like [Browserify][] or [Webpack][], or download the `yaku.js` file from [release page][].
It supports both `AMD` and `CMD`. Raw usage without `AMD` or `CMD`:

```html
<script type="text/javascript" src ="yaku.js"></script>
<script>
    // Yaku will be assigned to `window.Yaku`.
    var Promise = Yaku;
</script>
```

# Compare

These comparisons only reflect some limited truth, no one is better than all others on all aspects.

```
iojs v1.8.1
OS   darwin
Arch x64
CPU  Intel(R) Core(TM) i7-4850HQ CPU @ 2.30GHz
```

| Name                 | Unit Test | 1ms async task | sync task | Helpers | file size |
| -------------------- | --------- | -------------- | --------- | ------- | --------- |
| Yaku                 | 872/872   | 283ms          | 68ms      | ++      | 3.8KB |
| [Bluebird][] v2.9    | 872/872   | 272ms          | 164ms     | +++++++ | 73KB      |
| [ES6-promise][] v2.1 | 872/872   | 459ms          | 110ms     | +       | 18KB      |
| [native][] iojs v1.8 | 872/872   | 826ms          | 605ms     | +       | 0KB       |
| [q][] v1.3           | 208/872   | 2710ms         | 2327ms    | +++     | 24K       |

- **Helpers**: extra methods that help with your promise programming, such as
  async flow control helpers, debug helpers. For more details: [docs/debugHelperComparison.md][].
- **1ms async task**: `npm run no -- benchmark`, the smaller the better.
- **sync task**: `npm run no -- benchmark --sync`, the smaller the better.

# FAQ

- Better long stack trace support?

  > Latest Node.js and browsers are already support it. If you enabled it, Yaku will take advantage of it
  > without much overhead. Such as this library [longjohn][] for Node.js, or this article for [Chrome][crhome-lst].

- `catch` on old brwoser (IE7, IE8 etc)?

  > In ECMA-262 spec, `catch` cannot be used as method name. If you use `coffee-script`, it will handle the `catch` automatically, else you have to alias the method name or use something like `Promise.resolve()['catch'](function() {})` or `Promise.resolve().then(null, function() {})`.

- Will Yaku implement `done`, `finally`, `promisify`, etc?

  > No. All non-ES6 APIs are only implemented for debugging and testing, which means when you remove Yaku, everything
  > should works well with ES6 native promise. If you need fancy and magic, go for [Bluebird][].

- Why use [CoffeeScript][], not Javascript?

  > If it is really a problemn for people to use it, I will take time to translate it to JS.
  > Else, I'd like to keep the code as simple as CoffeeScript.

- The name Yaku is weird?

  > The name `yaku` comes from the word `約束(yakusoku)` which means promise.

# API

- ### **[constructor(executor)](src/yaku.coffee?source#L29)**

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

- ### **[then(onFulfilled, onRejected)](src/yaku.coffee?source#L59)**

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

- ### **[catch(onRejected)](src/yaku.coffee?source#L77)**

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

- ### **[@resolve(value)](src/yaku.coffee?source#L93)**

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

- ### **[@reject(reason)](src/yaku.coffee?source#L107)**

    The `Promise.reject(reason)` method returns a Promise object that is rejected with the given reason.

    - **<u>param</u>**: `reason` { _Any_ }

        Reason why this Promise rejected.

    - **<u>return</u>**: { _Yaku_ }

    - **<u>example</u>**:

        ```coffee
        Promise = require 'yaku'
        p = Promise.reject 10
        ```

- ### **[@race(iterable)](src/yaku.coffee?source#L129)**

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

- ### **[@all(iterable)](src/yaku.coffee?source#L166)**

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

- ### **[@onUnhandledRejection(reason)](src/yaku.coffee?source#L216)**

    Catch all possibly unhandled rejections. If you want to use specific
    format to display the error stack, overwrite it.
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

- ### **[@enableLongStackTrace](src/yaku.coffee?source#L236)**

    It is used to enable the long stack trace.
    Once it is enabled, it can't be reverted.
    While it is very helpful in development and testing environments,
    it is not recommended to use it in production. It will slow down your
    application and waste your memory.

    - **<u>example</u>**:

        ```coffee
        Promise = require 'yaku'
        Promise.enableLongStackTrace()
        ```



# Utils

To use it you have to require it separately: `utils = require 'yaku/lib/utils'`.
If you want to use it in the browser, you have to use `browserify` or `webpack`.

- ### **[async(limit, list, saveResults, progress)](src/utils.coffee?source#L68)**

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

        If a task ends, the resolve value will be
        passed to this function.

    - **<u>return</u>**: { _Promise_ }

    - **<u>example</u>**:

        ```coffee
        kit = require 'nokit'
        utils = require 'yaku/lib/utils'

        urls = [
         'http://a.com'
         'http://b.com'
         'http://c.com'
         'http://d.com'
        ]
        tasks = [
         -> kit.request url[0]
         -> kit.request url[1]
         -> kit.request url[2]
         -> kit.request url[3]
        ]

        utils.async(tasks).then ->
         kit.log 'all done!'

        utils.async(2, tasks).then ->
         kit.log 'max concurrent limit is 2'

        utils.async 3, ->
         url = urls.pop()
         if url
             kit.request url
         else
             utils.end
        .then ->
         kit.log 'all done!'
        ```

- ### **[callbackify(fn, self)](src/utils.coffee?source#L144)**

    If a function returns promise, convert it to
    node callback style function.

    - **<u>param</u>**: `fn` { _Function_ }

    - **<u>param</u>**: `self` { _Any_ }

        The `this` to bind to the fn.

    - **<u>return</u>**: { _Function_ }

- ### **[Deferred](src/utils.coffee?source#L166)**

    Create a `jQuery.Deferred` like object.

- ### **[end](src/utils.coffee?source#L178)**

    The end symbol.

- ### **[flow(fns)](src/utils.coffee?source#L233)**

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
        ```coffee
        kit = require 'nokit'
        utils = require 'yaku/lib/utils'

        createUrl = (name) ->
        	return "http://test.com/" + name

        curl = (url) ->
        	kit.request(url).then (body) ->
        		kit.log 'get'
        		body

        save = (str) ->
        	kit.outputFile('a.txt', str).then ->
        		kit.log 'saved'

        download = utils.flow createUrl, curl, save
        # same as "download = utils.flow [createUrl, curl, save]"

        download 'home'
        ```

    - **<u>example</u>**:

        Walk through first link of each page.
        ```coffee
        kit = require 'nokit'
        utils = require 'yaku/lib/utils'

        list = []
        iter = (url) ->
        	return utils.end if not url

        	kit.request url
        	.then (body) ->
        		list.push body
        		m = body.match /href="(.+?)"/
        		m[0] if m

        walker = utils.flow iter
        walker 'test.com'
        ```

- ### **[isPromise(obj)](src/utils.coffee?source#L279)**

    Check if an object is a promise-like object.

    - **<u>param</u>**: `obj` { _Object_ }

    - **<u>return</u>**: { _Boolean_ }

- ### **[promisify(fn, self)](src/utils.coffee?source#L304)**

    Convert a node callback style function to a function that returns
    promise when the last callback is not supplied.

    - **<u>param</u>**: `fn` { _Function_ }

    - **<u>param</u>**: `self` { _Any_ }

        The `this` to bind to the fn.

    - **<u>return</u>**: { _Function_ }

    - **<u>example</u>**:

        ```coffee
        foo = (val, cb) ->
        	setTimeout ->
        		cb null, val + 1

        bar = utils.promisify(foo)

        bar(0).then (val) ->
        	console.log val # output => 1

        # It also supports the callback style.
        bar 0, (err, val) ->
        	console.log val # output => 1
        ```

- ### **[sleep(time, val)](src/utils.coffee?source#L323)**

    Create a promise that will wait for a while before resolution.

    - **<u>param</u>**: `time` { _Integer_ }

        The unit is millisecond.

    - **<u>param</u>**: `val` { _Any_ }

        What the value this promise will resolve.

    - **<u>return</u>**: { _Promise_ }

- ### **[throw(err)](src/utils.coffee?source#L337)**

    Throw an error to break the program.

    - **<u>param</u>**: `err` { _Any_ }

    - **<u>example</u>**:

        ```coffee
        Promise.resolve().then ->
        	# This error won't be caught by promise.
        	utils.throw 'break the program!'
        ```



# Unit Test

This project use [promises-aplus-tests][] to test the compliance of Promise/A+ specification. There are about 900 test cases.

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