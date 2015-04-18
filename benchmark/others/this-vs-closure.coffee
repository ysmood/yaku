utils = require './utils'

class A
	constructor: ->
		@count1 = 0
		@count2 = 0

	bar1 = (self) ->
		self.count1++

	foo1: ->
		self = @
		do -> do ->
			bar1 self

	foo2: ->
		self = @
		do -> do ->
			self.bar2()

	bar2: ->
		@count2++

a = new A

utils.run 2, ->
	a.foo1()
console.log a.count1


utils.run 2, ->
	a.foo2()
console.log a.count2


utils.run 2, ->
	a.foo1()
console.log a.count1


utils.run 2, ->
	a.foo2()
console.log a.count2
