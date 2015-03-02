bluebird = require 'bluebird'

count = 10 ** 6
asyncTask = ->
	setTimeout ->
		null
	, 1

console.time()
process.on 'exit', ->
	console.timeEnd()

while count--
	asyncTask()