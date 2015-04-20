###

As a result execute closure at runtime is very expensive.

foo: 269ms
bar: 7ms

###

utils = require './utils'

foo = ->
	do ->
		1 + 2
		return

	return

foo_ = ->
	s = ->
		1 + 2
		return

	1 + 2

	return

bar = ->
	1 + 2
	return

test = (name, fn) ->
	countDown = 10 ** 6
	console.time(name)
	while countDown--
		fn()
	console.timeEnd(name)


test 'foo', foo
test 'foo_', foo_
test 'bar', bar