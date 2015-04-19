yaku = require '../src/yaku'
bluebird = require 'bluebird'
es6 = require('es6-promise').Promise
kit = require 'nokit'

test = (lib, p) ->
	p = lib.resolve 'err'
	.then (v) ->
		console.log v

test yaku
test bluebird
test es6
