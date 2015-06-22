Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    promise = new Promise (r) ->
        r {
            then: (ful) ->
                ful 'done'
        }

    promise.then((value) ->
        console.log(value)
    );

test Promise_Yaku
# test Promise_Bird
