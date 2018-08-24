<a href="http://promisesaplus.com/">
    <img src="http://promisesaplus.com/assets/logo-small.png" alt="Promises/A+ logo"
         title="Promises/A+ 1.1 compliant" align="right" />
</a>

# Overview

Yaku is full compatible with ES6's native [Promise][native], but much faster, and more error friendly.
If you want to learn how Promise works, read the minimum implementation [yaku.aplus][]. Without comments, it is only 80 lines of code (gzipped size is <%= doc.aplusSize %>KB).
It only implements the `constructor` and `then`.

Yaku passed all the tests of [promises-aplus-tests][], [promises-es6-tests][], and even the [core-js tests][].

I am not an optimization freak, I try to keep the source code readable and maintainable.
I write this lib to research one of my data structure ideas: [docs/lazyTree.md][].

[![NPM version](https://badge.fury.io/js/yaku.svg)](http://badge.fury.io/js/yaku) [![Build Status](https://travis-ci.org/ysmood/yaku.svg)](https://travis-ci.org/ysmood/yaku) [![Deps Up to Date](https://david-dm.org/ysmood/yaku.svg?style=flat)](https://david-dm.org/ysmood/yaku) [![Coverage Status](https://coveralls.io/repos/ysmood/yaku/badge.svg?branch=master&service=github)](https://coveralls.io/github/ysmood/yaku?branch=master)



# Features

- One of the best for mobile, gzipped file is only <%= doc.size %>KB
- Supports "uncaught rejection" and "long stack trace", [Comparison][docs/debugHelperComparison.md]
- Works on IE5+ and other major browsers
- 100% statement and branch test coverage
- Better CPU and memory performance than the native Promise
- Well commented source code with every Promises/A+ spec
- Highly modularized extra helpers, no pollution to its pure ES6 implements
- Supports ES7 `finally`



# Quick Start

## Node.js

```shell
npm install yaku
```

Then:

```js
var Promise = require('yaku');
```

Or if you don't want any extra debug helper, ES6 only version is here:

```js
var Promise = require('yaku/lib/yaku.core');
```

Or if you only want aplus support:

```js
var Promise = require('yaku/lib/yaku.aplus');
```

## Browser

Raw usage:

```html
<script type="text/javascript" src="https://raw.githubusercontent.com/ysmood/yaku/master/src/yaku.js"></script>
<script>
    // Yaku will be assigned to `window.Yaku`.
    var Promise = Yaku;
</script>
```



# Change Log

[docs/changelog.md](docs/changelog.md)



# Compare to Other Promise Libs

These comparisons only reflect some limited truth, no one is better than all others on all aspects.
There are tons of Promises/A+ implementations, you can see them [here](https://promisesaplus.com/implementations). Only some of the famous ones were tested.

You can reproduce it on your own machine with `npm run no -- benchmark`.

```
Date: Wed Aug 15 2018 23:06:02 GMT+0900 (Japan Standard Time)
Node v10.8.0
OS   darwin
Arch x64
CPU  Intel(R) Core(TM) i7-4850HQ CPU @ 2.30GHz
```

| name | unit tests | coverage | 1ms async task | optional helpers | helpers | gzip |
| ---- | ---------- | -------- | -------------- | ---------------- | ------- | ---- |
| [yaku][]@0.19.1 | ✓ | 100% 100% | 274ms / 112MB | ✓ | 35 | 1.9KB |
| [yaku.core][]@0.19.1 | ✓ | 100% 100% | 292ms / 110MB | ✓ | 29 | 1.6KB |
| [yaku.aplus][]@0.19.1 | x (91 failed) | 100% 100% | 328ms / 126MB | ✓ | 7 | 0.5KB |
| [bluebird][]@3.5.1 | x (33 failed) | 99% 96% | 183ms / 88MB | partial | 103 | 16.1KB |
| [es6-promise][]@4.2.4 | x (48 failed) | ? ? | 510ms / 106MB | x | 13 | 2.4KB |
| [pinkie][]@2.0.4 | x (45 failed) | ? ? | 284ms / 138MB | v | 10 | 1.2KB |
| [native][]@10.8.0 | ✓ | ? ? | 133ms / 86MB | x | 11 | 0KB |
| [core-js][]@2.5.7 | x (5 failed) | ? ? | 239ms / 99MB | x | 13 | 4.8KB |
| [es6-shim][]@0.35.3 | ✓ | ? ? | 161ms / 87MB | x | 11 | 15.6KB |
| [q][]@1.5.1 | x (21 failed) | ? ? | 896ms / 326MB | x | 74 | 4.7KB |
| [my-promise][]@1.1.0 | x (10 failed) | ? ? | 583ms / 224MB | x | 10 | 4KB |


- **unit test**: [promises-aplus-tests][], [promises-es6-tests][], and even the [core-js tests][].

- **coverage**: statement coverage and branch coverage.

- **helpers**: extra methods that help with your promise programming, such as
  async flow control helpers, debug helpers. For more details: [docs/debugHelperComparison.md][].

- **1ms async task**: `npm run no -- benchmark`, the smaller the better (total time / memory rss).

- **promises-es6-tests**: If you want to test `bluebird` against promises-es6-tests,
  run `npm run no -- test-es6 --shim bluebird`.

- **optional helpers**: Whether the helpers can be imported separately or not,
  which means you can load the lib without helpers. Such as the `bluebird-core`, it will inevitably load
  some nonstandard helpers: `spread`, `promisify`, etc.


# FAQ

- `catch` on old browsers (IE7, IE8 etc)?

  > In ECMA-262 spec, `catch` cannot be used as method name. You have to alias the method name or use something like `Promise.resolve()['catch'](function() {})` or `Promise.resolve().then(null, function() {})`.

- When using with Babel and Regenerator, the unhandled rejection doesn't work.

  > Because Regenerator use global Promise directly and don't have an api to set the Promise lib.
  > You have to import Yaku globally to make it use Yaku: `require("yaku/lib/global");`.


# Unhandled Rejection

Yaku will report any unhandled rejection via `console.error` by default, in case you forget to write `catch`.
You can catch them manually:

- Browser: `window.onunhandledrejection = ({ promise, reason }) => { /* Your Code */ };`
- Node: `process.on("unhandledRejection", (reason, promise) => { /* Your Code */ });`

For more spec read [Unhandled Rejection Tracking Browser Events](https://github.com/domenic/unhandled-rejections-browser-spec).


# API

- #### require('yaku')
<%= doc['src/yaku.js-toc'] %>

- #### require('yaku/lib/utils') or any of them like require('yaku/lib/retry')
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

# Contribution

Make sure you have `npm` and `npm install` at the root of the project first.

Other than use `gulp`, all my projects use [nokit][] to deal with automation.
Run `npm run no -- -h` to print all the tasks that you can use.

## Update `readme.md`

Please don't alter the `readme.md` directly, it is compiled from the `docs/readme.jst.md`.
Edit the `docs/readme.jst.md` and execute `npm run no` to rebuild the project.

[docs/lazyTree.md]: docs/lazyTree.md
[docs/debugHelperComparison.md]: docs/debugHelperComparison.md
[Bluebird]: https://github.com/petkaantonov/bluebird
[ES6-promise]: https://github.com/jakearchibald/es6-promise
[pinkie]: https://github.com/floatdrop/pinkie
[core-js tests]: https://github.com/ysmood/core-js/tree/promise-yaku
[native]: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects
[q]: https://github.com/kriskowal/q
[my-promise]: https://github.com/hax/my-promise
[core-js]: https://github.com/zloirock/core-js
[yaku]: https://github.com/ysmood/yaku
[yaku.core]: src/yaku.core.js
[yaku.aplus]: src/yaku.aplus.js
[es6-shim]: https://github.com/paulmillr/es6-shim
[docs/minPromiseAplus.js]: docs/minPromiseAplus.js
[promises-aplus-tests]: https://github.com/promises-aplus/promises-tests
[promises-es6-tests]: https://github.com/promises-es6/promises-es6
[longjohn]: https://github.com/mattinsler/longjohn
[crhome-lst]: http://www.html5rocks.com/en/tutorials/developertools/async-call-stack
[Browserify]: http://browserify.org
[Webpack]: http://webpack.github.io/
[nokit]: https://github.com/ysmood/nokit
[nofile.js]: nofile.js