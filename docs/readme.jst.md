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

- The minified file is only <%= doc.size %>KB (1.5KB gzipped) ([Bluebird][] / 73KB, [ES6-promise][] / 18KB)
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
| Yaku v0.12           |         ✓          |  328ms / 105mb       | +++     | <%= doc.size %>KB |
| [Bluebird][] v3.3    |         x          |  244ms / 86mb        | +++++++ | 73KB      |
| [ES6-promise][] v3.1 |         x          |  423ms / 112mb       | +       | 18KB      |
| [native][] v5.0      |         x          |  597ms / 173mb       | +       | 0KB       |
| [core-js][] v2.1.0   |         x          |  883ms / 196mb       | +       | 77KB      |
| [q][] v1.4           |         x          | 3313ms / 592mb       | +++     | 24K       |

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