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
	defer = {}

	defer.promise = new lib (resolve, reject) ->
		defer.resolve = resolve
		defer.reject = reject

	console.log defer
	defer

test yaku

# test bluebird
