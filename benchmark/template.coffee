kit = require 'nokit'
cs = kit.require 'colors/safe'

###*
 * The test will last for 5 seconds.
 * Each promise only do 1ms async task.
 * When each task ends, a new task will run.
 * There are 10 init tasks.
###

module.exports = (name, Promise) ->

	resolveCount = 0
	start = Date.now()

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
			, 1
		.then ->
			resolveCount++
			asyncTask()

			checkEnd()

	kit._.times 10, ->
		asyncTask()
