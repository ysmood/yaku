
module.exports = (name, Promise) ->

	resolveCount = 0
	start = Date.now()

	checkEnd = ->
		kit = require 'nokit'
		cs = kit.require 'colors/safe'

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

	asyncTask()
