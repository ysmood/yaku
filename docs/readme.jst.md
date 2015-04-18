# Overview

If you want to learn how Promise works, read the minimum implementation [docs/minPromiseA+.coffee][]. Without comments, it has only about 100 lines of code.
It only implements the `constructor` and `then`. It passed all the tests of [promises-aplus-tests][].

## Features

- The minified file is only 3KB (`bluebird` / 73KB, `es6-promise` / 18KB)
- 100% compliant with Promise/A+ specs
- Better performance than the native Promise
- Works on IE5+ and other major browsers

# Road Map

I will only implement these basic functions.

- [x] `constructor: (executor) ->`

- [x] `then: (onFulfilled, onRejected) ->`

- [x] `catch: (onRejected) ->`

- [x] `@all: (iterable) ->`

- [x] `@race: (iterable) ->`

- [x] `@reject: (reason) ->`

- [x] `@resolve: (value) ->`

- [x] Cross platform

- [ ] Possibly unhandled error

- [ ] Long stack trace


# Unit Test

This project use [promises-aplus-tests][] to test the compliance of Promise/A+ specification. There are about 900 test cases.

Use `npm run no -- test` to run the unit test.

# Benchmark

Use `npm run no -- benchmark` to run the benchmark.

# Misc.

The name `yaku` comes from the word `約束` which means promise.


[docs/minPromiseA+.coffee]: docs/minPromiseA+.coffee
[promises-aplus-tests]: https://github.com/promises-aplus/promises-tests