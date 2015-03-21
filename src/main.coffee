
class Promise

	constructor: (executor) ->
		@_value = null
		@_fulfillHandlers = []
		@_rejectHandlers = []

		run @, executor

	then: (onFulfilled, onRejected) ->
		@_fulfillHandlers.push onFulfilled

		newPromise @

	catch: (onRejected) ->

	@all = (iterable) ->

	@race = (iterable) ->

	@reject = (reason) ->

	@resolve = (value) ->

# ********************** Private **********************

	# These are some static symbols.
	$pending = 0
	$resolved = 1
	$rejected = 2

	_state: $pending
	_value: null
	_fulfillHandlers: []
	_rejectHandlers: []

	nextTick = (fn) ->
		process.nextTick fn

	run = (self, executor) -> nextTick ->
		executor resolve(self), reject(self)

	newPromise = (self) -> new Promise (resolve, reject) ->
		self._fulfillHandlers.push resolve

	reject = (self) -> (reason) ->
		self._state = $rejected
		self._value = reason

	resolve = (self) -> (result) ->
		self._state = $resolved
		self._value = result

		for handler in self._fulfillHandlers
			handler result

		return

module.exports = Promise