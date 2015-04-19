kit = require 'nokit'
cs = kit.require 'colors/safe'

###*
 * The test will last for 5 seconds.
 * Each promise only do 1ms async task.
 * When each task ends, two new tasks will run.
###

module.exports = (name, Promise) ->

	countDown = 10 ** 5
	start = Date.now()

	checkEnd = ->
		return if --countDown

		time = Date.now() - start

		mem = process.memoryUsage()
		for k of mem
			mem[k] = Math.floor(mem[k] / 1024 / 1024) + 'mb'

		console.log """
		#{cs.cyan kit._.padRight(name, 15)}
		    	     time: #{cs.green time}
		     memory usage: #{JSON.stringify mem}
		"""

	asyncTask = ->
		new Promise (resolve) ->
			resolve()
		.then ->
			checkEnd()

	i = countDown
	while i--
		asyncTask()
