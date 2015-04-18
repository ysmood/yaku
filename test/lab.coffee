yaku = require '../src/yaku'
bluebird = require 'bluebird'
kit = require 'nokit'

test = (lib, p) ->
	p = lib.reject 'err'
	.then -> null
	.catch -> null

test yaku

# test bluebird
