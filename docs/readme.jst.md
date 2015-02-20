# Under Development

Why another Promise lib?

- Bluebird is too big with a lot of non-standard helper functions.
- I need better performance (maybe I'll use asm.js).

# Road Map

I will only implement these basic functions.

- [ ] `constructor: (executor) ->`

- [ ] `then: (onFulfilled, onRejected) ->`

- [ ] `catch: (onRejected) ->`

- [ ] `@all: (iterable) ->`

- [ ] `@race: (iterable) ->`

- [ ] `@reject: (reason) ->`

- [ ] `@resolve: (value) ->`

- [ ] Long stack trace

- [ ] Possibly unhandled error

# Misc.

The name `yaku` comes from the word `約束` which means promise.
