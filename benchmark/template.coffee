kit = require 'nokit'
cs = kit.require 'colors/safe'

###*
 * The test will last for 5 seconds.
 * Each promise only do 1ms async task.
 * When each task ends, two new tasks will run.
###

module.exports = (name, Promise) ->

	resolveCount = 0
	start = Date.now()
	taskSpan = 1

	checkEnd = ->
		if Date.now() - start >= 1000 * 3
			mem = process.memoryUsage()
			for k of mem
				mem[k] = Math.floor(mem[k] / 1024 / 1024) + 'mb'

			console.log """
			#{cs.cyan kit._.padRight(name, 15)}
			    resolve count: #{cs.green resolveCount}
			     memory usage: #{JSON.stringify mem}
			"""

			process.exit()

	asyncTask = ->
		new Promise (resolve) ->
			setTimeout ->
				resolve()
			, taskSpan
		.then ->
			resolveCount++

			asyncTask()
			asyncTask()

			checkEnd()
			return

	asyncTask()
