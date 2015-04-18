
test = ->
	count = 0

	foo = ->
		count++

	start = Date.now()

	while Date.now() - start < 1000 * 2
		foo()

	console.log count


test2 = ->
	try
		count = 0

		foo = ->
			count++

		start = Date.now()

		while Date.now() - start < 1000 * 2
			foo()

		console.log count

test()

try
	test()

test2()