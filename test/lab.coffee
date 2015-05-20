yaku = require '../src/yaku'
bluebird = require 'bluebird'
es6 = require('es6-promise').Promise
kit = require 'nokit'

test = (lib, p) ->
    lib.enableLongStackTrace()

    new lib (r, rr) ->
        a = 10

        a.b.c()
    # .catch ->


test yaku
# test bluebird
# test es6
