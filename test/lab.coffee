Promise = require '../src/yaku'

p = Promise.resolve 10

p.then(->)

p.then (v) ->
    console.log v
    pp = new Promise ->
    pp.id = 'pp'
    pp
