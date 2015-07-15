Promise = require '../src/yaku'

p = Promise.resolve()
count = 0

setInterval ->
    p = p.then ->
        new Promise (r) ->
            setTimeout ->
                count++
                r { data: 'ok' }

setInterval ->
    console.log count, process.memoryUsage()
, 1000
