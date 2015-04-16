
module.exports = (name, Promise) ->

	count = 10 ** 5
	resolveCount = 0

	asyncTask = ->
		new Promise (resolve) ->
			setTimeout ->
				resolve()
			, 1
		.then ->
			resolveCount++

	process.on 'exit', ->
		console.timeEnd name
		console.log 'Resolve Count:', resolveCount
		console.log '***********'

	console.time name
	while count--
		asyncTask()
