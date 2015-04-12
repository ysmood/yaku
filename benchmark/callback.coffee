bluebird = require 'bluebird'

count = 10 ** 5
asyncTask = ->
	setTimeout ->
		null
	, 1

console.time 'callback'
process.on 'exit', ->
	console.timeEnd 'callback'

while count--
	asyncTask()