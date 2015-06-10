Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    p = Promise.resolve()
    p.then ->
        new Promise (r) ->
            setTimeout ->
                r 10
            , 10
    .then (v) ->
        console.log v

test Promise_Yaku
# test Promise_Bird
