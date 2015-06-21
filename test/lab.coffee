Promise_Yaku = require '../src/yaku'
Promise_Bird = require 'bluebird'

Promise_Yaku.enableLongStackTrace()
Promise_Bird.longStackTraces()

test = (Promise) ->
    resolved = (v) ->
        new Promise (r) ->
           r v

    promise = resolved({ dummy: "dummy" }).then(->
        {
            then: (resolvePromise) ->
                resolvePromise resolved({
                    then: (onFulfilled) ->
                        onFulfilled({ sentinel: "sentinel" });
                })
        };
    );

    promise.then((value) ->
        console.log(value)
    );

test Promise_Yaku
# test Promise_Bird
