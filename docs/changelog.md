- v0.11

  - **API CHANGE** now `utils.source` is removed, instead `utils.Observable` is added.
  - opt: performance
  - fix: a bind bug of promisify

- v0.8.0

  - **API CHANGE** `Yaku.onUnhandledRejection` is removed, instead use a more famous spec
  - **API CHANGE** removed `utils.end`
  - add: `utils.any`

- v0.7.12

  - add: now Yaku supports ES6 iterable
  - fix: #22 don't overwrite the prototype
  - fix: #21 ignore old IE `Error.prototype.stack`
  - add: #20 support global rejection event

- v0.7.11

  - add: `retry` helper.
  - add: some function names for reflection.

- v0.7.7

  - minor: add an unique type flag of Yaku
  - opt: performance

- v0.7.4

  - fix: a multiple resovle bug

- v0.7.2

  - add: `utils.source`
  - fix: a stack info typo

- v0.4.0

  - **API CHANGE** constructor's context is now promise itself

- v0.3.9

  - minor changes

- v0.3.8

  - fix: #10 old IE support
  - fix: a bug of utils.throw
  - fix: an unhandled rejection bug

- v0.3.3

  - fix: an unhandled rejection bug when rejects inside a catch
  - opt: utils
  - add: constructor `self` api

- v0.3.1

  - add: nextTick api

- v0.3.0

  - opt: minor change, better performance
  - fix: #8

- v0.2.8

  - fix: error handler bugs of `utils.async` and `utils.flow`.

- v0.2.7

  - opt: long stack trace

- v0.2.5

  - add: some useful utils

- v0.2.3

  - fix: #5 long stack trace bug

- v0.1.9

  - fix: `__filename` is not defined bug on browser.

- v0.1.8

  - better error log

- v0.1.6

  - add: #3 support long stack trace

- v0.1.5

  - fix: #2 Double unhandled rejection log

- v0.1.4

  - fix: Yaku.all array type bug
