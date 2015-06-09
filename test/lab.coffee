Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    p = Promise.resolve()
    .then ->
        # a()
        Promise.reject({a: 10})
    # .catch -> 0

    p.then -> 1
    p.then -> 2

test Promise_Yaku
# test Promise_Bird
