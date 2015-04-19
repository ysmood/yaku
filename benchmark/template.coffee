kit = require 'nokit'
cs = kit.require 'colors/safe'

###*
 * The test will run 10 ^ 5 promise.
 * Each promise will resolve immediately.
 * When all tasks are done, print out how much time it takes.
###

module.exports = (name, Promise) ->

	countDown = 10 ** 5

	checkEnd = ->
		return if --countDown
		logResult()

	logResult = ->
		resolutionTime = Date.now() - startResolution

		mem = process.memoryUsage()
		memFormat = []
		for k, v of mem
			memFormat.push "#{k} - #{Math.floor(v / 1024 / 1024)}mb"

		console.log """
		#{cs.cyan kit._.padRight(name, 15)}
		       total: #{cs.green initTime + resolutionTime}ms
		        init: #{initTime}ms
		  resolution: #{resolutionTime}ms
		      memory: #{memFormat.join(' | ')}
		"""

	asyncTask = ->
		new Promise((resolve) -> resolve()).then checkEnd

	i = countDown

	initStart = Date.now()

	while i--
		asyncTask()

	initTime = Date.now() - initStart

	startResolution = Date.now()
