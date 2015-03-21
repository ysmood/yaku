Promise = require '../src/main'

p = new Promise (r) ->
	setTimeout ->
		r 0
	, 100


p
.then (v) ->
	console.log v
.then ->
	console.log 'OK'

