yaku = require '../src/yaku'
bluebird = require 'bluebird'
kit = require 'nokit'

create = (lib) ->
	new lib (r, rr) ->
		t = Math.random() * 100
		console.log 'time', t
		setTimeout ->
			console.log 'done', t
			r t
		, t

test = (lib, p) ->
	p = lib.resolve({num: 10}).then ->
		{
			then: (fulfil) ->
				fulfil null
				throw {err: 'xxx'}
		}

	p.then (v) ->
		console.log v

test yaku

# test bluebird
