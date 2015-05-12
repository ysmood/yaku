yaku = require '../src/yaku'
bluebird = require 'bluebird'
es6 = require('es6-promise').Promise
kit = require 'nokit'

test = (lib, p) ->
    # lib.enableLongStackTrace()

    lib.resolve()
    .then ->
        new lib (r, rr) ->
            rr 1


# test yaku
test bluebird
# test es6
