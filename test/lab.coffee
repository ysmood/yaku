Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    p = new Promise (r) ->
        r new Promise (r) ->
            a()

    p.then((value) ->
        console.log(value)
    );

test Promise_Yaku
# test Promise_Bird
