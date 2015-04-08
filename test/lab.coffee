yaku = require '../src/main'
bluebird = require 'bluebird'

create = (lib) ->
	new lib (r, rr) ->
		setTimeout ->
			rr 0
		, 100

test = (p) ->
	p
	.then undefined, ->
		console.log 'ok'
		1
	.then (v) ->
		console.log v

test create yaku

# test create bluebird
