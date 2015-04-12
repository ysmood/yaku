yaku = require '../src/yaku'
bluebird = require 'bluebird'

create = (lib) ->
	new lib (r, rr) ->
		setTimeout ->
			r 0
		, 100

test = (lib, p) ->
	p
	.then()
	.then (v) ->
		new lib (r, rr) ->
			console.log v
			rr v + 1
	.then (v) ->
		console.log v
	, (v) ->
		console.log 'reject', v

test yaku, create yaku

# test bluebird, create bluebird
