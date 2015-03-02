bluebird = require 'bluebird'

count = 10 ** 6
asyncTask = ->
	new bluebird (resolve) ->
		setTimeout ->
			resolve()
		, 1

console.time()
process.on 'exit', ->
	console.timeEnd()

while count--
	asyncTask()