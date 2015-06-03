Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    p0 = Promise.resolve()
    p1 = p0.then ->
        Promise.reject 10
    p2 = p1.then -> null

test Promise_Yaku
# test Promise_Bird
