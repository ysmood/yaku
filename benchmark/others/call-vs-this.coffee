utils = require './utils'

foo = ->
	@count++

bar = (self) ->
	self.count++

obj = count: 0
utils.run 3, ->
	foo.call obj
console.log obj.count


obj = count: 0
utils.run 3, ->
	bar obj
console.log obj.count
