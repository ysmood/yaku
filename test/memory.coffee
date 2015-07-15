Promise = require '../src/yaku'
utils = require '../src/utils'

p = Promise.resolve()

setInterval ->
    p = p.then ->
        return utils.sleep 0, { data: 'ok' }


setInterval ->
    console.log process.memoryUsage()
, 1000
