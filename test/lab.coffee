yaku = require '../src/main'
bluebird = require 'bluebird'

create = (lib) ->
	new lib (r, rr) ->
		setTimeout ->
			r 0
		, 100

test = (lib, p) ->
	p
	.then (v) ->
		new lib (r) ->
			console.log v
			r v + 1
	.then (v) ->
		console.log v

test yaku, create yaku

# test bluebird, create bluebird
