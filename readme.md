# Overview

Compare Yaku to other implementations:

| Name         | Minified Size  | Performance |
|--------------|----------------|-------------|
| yaku         | 2KB            | 342332      |
| es6-promise  | 18KB           | 342856      |
| bluebird     | 73KB           | 339745      |

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

### Sample Result

```
es6-promise     Resolve Count: 342856
yaku            Resolve Count: 342332
bluebird        Resolve Count: 339745
Native          Resolve Count: 291268
```

# Misc.

The name `yaku` comes from the word `約束` which means promise.


[promises-aplus-tests]: https://github.com/promises-aplus/promises-tests