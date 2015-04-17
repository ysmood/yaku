kit = require 'nokit'
cs = kit.require 'colors/safe'

###*
 * The test will last for 5 seconds.
 * Each promise only do 1ms async task.
 * When each task ends, a new task will run.
 * There are 100 init tasks.
###

module.exports = (name, Promise) ->

	resolveCount = 0
	start = Date.now()
	taskSpan = 1
	initTasks = 100

	checkEnd = ->
		if Date.now() - start >= 1000 * 5
			console.log """
			#{cs.cyan kit._.padRight(name, 15)} Resolve Count: #{cs.green resolveCount}
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

			checkEnd()

	kit._.times initTasks, ->
		asyncTask()
