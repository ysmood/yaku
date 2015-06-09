Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    p = Promise.resolve()
    .then ->
        a()
        Promise.resolve({a: 10})
    # .catch -> 0

    p.then (v) -> console.log v
    # .catch -> 0
    p.then (v) -> console.log v

    # Promise.reject(10)
    # .catch -> 0

test Promise_Yaku
# test Promise_Bird
