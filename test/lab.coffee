yaku = require '../src/yaku'
bluebird = require 'bluebird'
es6 = require('es6-promise').Promise
kit = require 'nokit'

test = (lib, p) ->
	gen = (i) ->
		new Promise (r) ->
			setTimeout ->
				r(i)
			, Math.random() * 100

	c = 0

	lib.all [
		gen(c++)
		gen(c++)
		gen(c++)
		gen(c++)
		gen(c++)
		gen(c++)
	]
	.then kit.log


test yaku
# test bluebird
# test es6
