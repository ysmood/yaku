Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    new Promise (r, rr) ->
        rr(10)
    .then ->

test Promise_Yaku
# test Promise_Bird
