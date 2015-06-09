Yaku = require '../src/yaku'
Yaku.enableLongStackTrace()

newYaku = ->
    oldOnUnhandledRejection = Yaku.onUnhandledRejection

    Yaku.onUnhandledRejection = (reason, p) ->
        info = oldOnUnhandledRejection reason, p
        console.log info.map (trace) ->
            trace = trace.stack or trace.toString()

            trace.replace(///.+/src/yaku.coffee.+\n?///g, '').match(/:(\d+):/)[1]

Promise.resolve()
.then ->
    unDefined()
