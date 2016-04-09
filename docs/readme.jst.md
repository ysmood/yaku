<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>

# Overview

Yaku is full compatible with ES6's native [Promise][native], but much faster, and more error friendly.
If you want to learn how Promise works, read the minimum implementation [docs/minPromiseAplus.js][]. Without comments, it is only 80 lines of code (gzipped size is 0.5KB).
It only implements the `constructor` and `then`.

Yaku passed all the tests of [promises-aplus-tests][], [promises-es6-tests][], and even the [core-js tests][].

I am not an optimization freak, I try to keep the source code readable and maintainable.
Premature optimization is the root of all evil. I write this lib to research one of my data structure
ideas: [docs/lazyTree.md][].

[![NPM version](https://badge.fury.io/js/yaku.svg)](http://badge.fury.io/js/yaku) [![Build Status](https://travis-ci.org/ysmood/yaku.svg)](https://travis-ci.org/ysmood/yaku) [![Deps Up to Date](https://david-dm.org/ysmood/yaku.svg?style=flat)](https://david-dm.org/ysmood/yaku)



# Features

- The minified file is only <%= doc.size %>KB (1.8KB gzipped)
- Supports "uncaught rejection" and "long stack trace", [Comparison][docs/debugHelperComparison.md]
- The only lib that passed all major Promise Spec tests, even the v8 native Promise doesn't
- Designed to work on IE5+ and other major browsers
- Much better performance than the native Promise
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

```
Node v5.6.0
OS   darwin
Arch x64
CPU  Intel(R) Core(TM) i7-4850HQ CPU @ 2.30GHz
```

| name | unit tests | 1ms async task | optional helpers | helpers | min js |
| ---- | ---------- | -------------- | ---------------- | ------- | ------ |
| [yaku][]@0.13.7 | ✓ | 341ms / 108MB | ✓ | 31 | 3.9KB |
| [bluebird][]@3.3.4 | x (28 failing) | 291ms / 89MB | partial | 100 | 52.2KB |
| [es6-promise][]@3.1.2 | x (27 failing) | 509ms / 113MB | x | 10 | 6.3KB |
| [native][]@0.13.7 | x (9 failing) | 681ms / 168MB | x | 13 | 0KB |
| [core-js][]@2.2.1 | x (4 failing) | 910ms / 195MB | x | 11 | 12.2KB |
| [es6-shim][]@0.35.0 | x (2 failing) | 1055ms / 145MB | x | 12 | 131.5KB |
| [q][]@1.4.1 | x (68 failing) | 1594ms / 425MB | x | 74 | 15.4KB |

- **Helpers**: extra methods that help with your promise programming, such as
  async flow control helpers, debug helpers. For more details: [docs/debugHelperComparison.md][].

- **1ms async task**: `npm run no -- benchmark`, the smaller the better (total time / memory rss).

- **promises-es6-tests**: If you want to test `bluebird` against promises-es6-tests,
  run `npm run no -- test-es6 --shim bluebird`.

- **optional helpers**: Whether the helpers can be imported separately or not,
  which means you can load the lib without helpers. Such as the `bluebird-core`, it will inevitably load
  some nonstandard helpers: `spread`, `finally`, etc.


# FAQ

- `catch` on old brwoser (IE7, IE8 etc)?

  > In ECMA-262 spec, `catch` cannot be used as method name. You have to alias the method name or use something like `Promise.resolve()['catch'](function() {})` or `Promise.resolve().then(null, function() {})`.

- Will Yaku implement `done`, `finally`, etc?

  > No. All non-ES6 APIs are only implemented for debugging and testing, which means when you remove Yaku, everything
  > should work well with ES6 native promise.

- When using with Babel and Regenerator, the unhandled rejection doesn't work.

  > Because Regenerator use global Promise directly and don't have an api to set the Promise lib.
  > You have to import Yaku globally to make it use Yaku: `require("yaku/lib/global");`.

- The name Yaku is weird?

  > The name `yaku` comes from the word `約束(yaku soku)` which means promise.


# Unhandled Rejection

Yaku will report any unhandled rejection via `console.error` by default, in case you forget to write `catch`.
You can catch them manually:

- Browser: `window.onunhandledrejection = ({ promise, reason }) => { /* Your Code */ };`
- Node: `process.on("unhandledRejection", (reason, promise) => { /* Your Code */ });`

For more spec read [Unhandled Rejection Tracking Browser Events](https://github.com/domenic/unhandled-rejections-browser-spec).


# API

- #### require('yaku')
<%= doc['src/yaku.js-toc'] %>

- #### require('yaku/lib/utils')
<%= doc['src/utils.js-toc'] %>

- #### require('yaku/lib/Observable')
<%= doc['src/Observable.js-toc'] %>

---------------------------------------


<%= doc['src/yaku.js'] %>



# Utils

It's a bundle of all the following functions. You can require them all with `var yutils = require("yaku/lib/utils")`,
or require them separately like `require("yaku/lib/flow")`. If you want to use it in the browser, you have to use `browserify` or `webpack`. You can even use another Promise lib, such as:

```js
require("yaku/lib/_").Promise = require("bluebird");
var source = require("yaku/lib/source");

// now "source" use bluebird instead of yaku.
```

<%= doc['src/utils.js'] %>


# Observable

<%= doc['src/Observable.js'] %>



# Unit Test

This project use [promises-aplus-tests][] to test the compliance of Promises/A+ specification. There are about 900 test cases.

Use `npm run no -- test` to run the unit test against yaku.

## Test other libs

### basic test

To test `bluebird`: `npm run no -- test-basic --shim bluebird`

The `bluebird` can be replaced with other lib, see the `test/getPromise.js` for which libs are supported.

### aplus test

To test `bluebird`: `npm run no -- test-aplus --shim bluebird`

The `bluebird` can be replaced with other lib, see the `test/getPromise.js` for which libs are supported.

### es6 test

To test `bluebird`: `npm run no -- test-es6 --shim bluebird`

The `bluebird` can be replaced with other lib, see the `test/getPromise.js` for which libs are supported.


# Benchmark

Use `npm run no -- benchmark` to run the benchmark.

## async/await generator wrapper

```
Node v5.6.0
OS   darwin
Arch x64
CPU  Intel(R) Core(TM) i7-4770HQ CPU @ 2.20GHz

yaku: 117ms
co: 283ms
bluebird: 643ms
```

# Contribute

Other than use `gulp`, all my projects use [nokit][] to deal with automation.
Run `npm run no -- -h` to print all the tasks that defined in the [nofile.js][].
If you installed `nokit` globally, you can just run `no -h` without `npm run` and `--`.


[docs/lazyTree.md]: docs/lazyTree.md
[docs/debugHelperComparison.md]: docs/debugHelperComparison.md
[Bluebird]: https://github.com/petkaantonov/bluebird
[ES6-promise]: https://github.com/jakearchibald/es6-promise
[core-js tests]: https://github.com/ysmood/core-js/tree/promise-yaku
[native]: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
[q]: https://github.com/kriskowal/q
[core-js]: https://github.com/zloirock/core-js
[yaku]: https://github.com/ysmood/yaku
[es6-shim]: https://github.com/paulmillr/es6-shim
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