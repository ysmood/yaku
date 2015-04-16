# Under Development

Why another Promise lib?

- Bluebird is too big with a lot of non-standard helper functions.
- I need better performance (maybe I'll use asm.js).

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

- [ ] Long stack trace

- [ ] Possibly unhandled error


# Unit Test

This project use [promises-aplus-tests][] to test the compliance of Promise/A+ specification. There are about 900 test cases.

Use `npm run no -- test` to run the unit test.

# Benchmark

Use `npm run no -- benchmark` to run the benchmark.

### Sample Result

```
yaku            Resolve Count: 39252
es6-promise     Resolve Count: 39045
bluebird        Resolve Count: 6204
```

# Misc.

The name `yaku` comes from the word `約束` which means promise.


[promises-aplus-tests]: https://github.com/promises-aplus/promises-tests