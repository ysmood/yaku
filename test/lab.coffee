yaku = require '../src/yaku'
bluebird = require 'bluebird'
es6 = require('es6-promise').Promise
kit = require 'nokit'

test = (lib, p) ->
	lib.resolve('ok').then ->
		lib.reject 'info'
	.catch ->
		console.log 'ok'


test yaku
# test bluebird
# test es6
