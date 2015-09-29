Promise = require '../src/yaku'
utils = require '../src/utils'

c = 0
fn = (v) ->
    console.log('do')
    utils.sleep(0).then ->
        if c++ < 2
            throw 1
        else
            v


utils.retry(3, fn)('ok').then (v) ->
    console.log 'done', v
, (errs) ->
    console.log 'err', errs, c