Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    Promise.resolve()
    .then ->
        a()
    .then -> null
    .catch -> 'ok'

    # Promise.reject(10)

test Promise_Yaku
# test Promise_Bird
