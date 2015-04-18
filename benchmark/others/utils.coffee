
module.exports =

	run: (span, fn) ->
		span = span * 1000
		start = Date.now()
		count = 0

		while Date.now() - start < span
			fn()
			count++

		count