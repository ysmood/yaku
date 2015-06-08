Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    p = Promise.resolve()
    .then ->
        Promise.reject(10)
    .then -> null

    p1 = p.then -> 'ok'
    p2 = p.then -> 'test'

test Promise_Yaku
# test Promise_Bird
