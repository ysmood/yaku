Promise = require '../src/yaku'
utils = require '../src/utils'

utils.async 2, ->
	new Promise (r) ->
		console.log 'tick'
		setTimeout r, 1000
