yaku = require '../src/yaku'
bluebird = require 'bluebird'
es6 = require('es6-promise').Promise
kit = require 'nokit'

test = (lib, p) ->
    # lib.enableLongStackTrace()

    p = new lib (r, rr) ->
        a = 10

        a.b.c()

    p.then ->

    p.then ->

test yaku
# test bluebird
# test es6
