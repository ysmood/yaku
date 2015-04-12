yaku = require '../dist/yaku'

count = 10 ** 5
asyncTask = ->
	new yaku (resolve) ->
		setTimeout ->
			resolve()
		, 1

console.time 'yaku'
process.on 'exit', ->
	console.timeEnd 'yaku'

while count--
	asyncTask()