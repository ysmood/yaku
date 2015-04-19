kit = require 'nokit'
cs = kit.require 'colors/safe'

###*
 * The test will run 10 ^ 5 promise.
 * Each promise will resolve immediately.
 * When all tasks are done, print out how much time it takes.
###

module.exports = (name, Promise) ->

	countDown = 10 ** 5

	isEnd = ->
		return if --countDown
		logResult()

	logResult = ->
		time = Date.now() - startTime

		mem = process.memoryUsage()
		for k of mem
			mem[k] = Math.floor(mem[k] / 1024 / 1024) + 'mb'

		console.log """
		#{cs.cyan kit._.padRight(name, 15)}
		    	     time: #{cs.green time}ms
		     memory usage: #{JSON.stringify mem}
		"""

	asyncTask = ->
		new Promise((resolve) -> resolve())

	i = countDown
	console.time name
	while i--
		asyncTask()
	console.timeEnd name

	startTime = Date.now()
