var Promise_Yaku = require('../dist/yaku')
var Promise_Bird = require('bluebird')

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

var test = function (Promise) {
    var p = Promise.resolve()
    .then(function () {
        undefinedFunction()
    }).then(function () {})

    var p1 = p.then(function () {})
    var p2 = p.then(function () {})
}

test(Promise_Yaku)
test(Promise_Bird)
