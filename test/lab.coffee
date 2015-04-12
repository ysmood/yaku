yaku = require '../src/yaku'
bluebird = require 'bluebird'

create = (lib) ->
	new lib (r, rr) ->
		t = Math.random() * 100
		console.log 'time', t
		setTimeout ->
			console.log 'done', t
			r t
		, t

test = (lib, p) ->
	lib.all [
		lib.resolve create yaku
		create yaku
	]
	.then (res) ->
		console.log res
	.catch (v) ->
		console.log 'reject', v

test yaku

# test bluebird, create bluebird
