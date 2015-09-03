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

- The minified file is only <%= doc.size %>KB (1.5KB gzipped) ([Bluebird][] / 73KB, [ES6-promise][] / 18KB)
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
| Yaku                 |  257ms / 110MB       |  126ms / 80MB   | +++     | <%= doc.size %>KB |
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

- Better long stack trace support?

  > Latest Node.js and browsers are already support it. If you enabled it, Yaku will take advantage of it
  > without much overhead. Such as this library [longjohn][] for Node.js, or this article for [Chrome][crhome-lst].

- The name Yaku is weird?

  > The name `yaku` comes from the word `約束(yakusoku)` which means promise.

# API

<%= doc['src/yaku.js'] %>

# Utils

To use it you have to require it separately: `var yutils = require("yaku/lib/utils")`.
If you want to use it in the browser, you have to use `browserify` or `webpack`.

<%= doc['src/utils.coffee'] %>

# Source

To use it you have to require it separately: `var ysource = require("yaku/lib/source")`.

<%= doc['src/source.js'] %>

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