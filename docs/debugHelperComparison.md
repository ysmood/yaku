### Better unhandled error

Here the error is actually caught by the handler on `L14`.
Only `Yaku` will not report an `unhandled error`. Even the
native works improperly.

```javascript
var Yaku = require('../dist/yaku')
var Bluebird = require('bluebird')

Yaku.enableLongStackTrace()
Bluebird.longStackTraces()

test = function (Promise) {
    p = Promise.resolve().then(function () {
        abc()
    })

    p.then(function () {})

    p.catch(function () {})  // L14
}

test(Yaku)
test(Bluebird)
test(Promise) // Native
```


### More details for long stack trace

Only Yaku will trace back to the root the Promise chain.

```javascript
var Yaku = require('../dist/yaku')
var Bluebird = require('bluebird')

Yaku.enableLongStackTrace()
Bluebird.longStackTraces()

test = function (Promise) {
    Promise.resolve()        // L8
    .then(function () {      // L9
        abc()                // L10
    })
}

test(Yaku)
test(Bluebird)
test(Promise) // Native
```

Trace info of Bluebird:

```
Unhandled rejection ReferenceError: abc is not defined
    at /Users/ys/Cosmos/Cradle/Vane/yaku/test/longStackTrace.js:10:9
    at processImmediate [as _immediateCallback] (timers.js:358:17)
From previous event:
    at test (/Users/ys/Cosmos/Cradle/Vane/yaku/test/longStackTrace.js:9:6)
    at Object.<anonymous> (/Users/ys/Cosmos/Cradle/Vane/yaku/test/longStackTrace.js:15:1)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
```

Trace info of Yaku:

```
Unhandled Rejection: ReferenceError: abc is not defined
    at /Users/ys/Cosmos/Cradle/Vane/yaku/test/longStackTrace.js:10:9
    at Timer.listOnTimeout (timers.js:110:15)
From previous event:
    at test (/Users/ys/Cosmos/Cradle/Vane/yaku/test/longStackTrace.js:9:6)
    at Object.<anonymous> (/Users/ys/Cosmos/Cradle/Vane/yaku/test/longStackTrace.js:14:1)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
From previous event:
    at test (/Users/ys/Cosmos/Cradle/Vane/yaku/test/longStackTrace.js:8:13)
    at Object.<anonymous> (/Users/ys/Cosmos/Cradle/Vane/yaku/test/longStackTrace.js:14:1)
    at Module._compile (module.js:460:26)
    at Object.Module._extensions..js (module.js:478:10)
    at Module.load (module.js:355:32)
    at Function.Module._load (module.js:310:12)
    at Function.Module.runMain (module.js:501:10)
    at startup (node.js:129:16)
    at node.js:814:3
```