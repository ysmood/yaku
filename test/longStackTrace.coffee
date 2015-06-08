Promise = require '../dist/yaku'

Promise.enableLongStackTrace()

Promise.onUnhandledException = function (err) {
    // body...
}