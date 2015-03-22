
class Promise

	###*
	 * Recieve a callback.
	 * @param  {Function} executor Function object with two arguments resolve and reject.
	 * The first argument fulfills the promise, the second argument rejects it.
	 * We can call these functions, once our operation is completed.
	###
	constructor: (executor) ->
		@_value = null
		@_fulfillHandlers = []
		@_rejectHandlers = []

		run @, executor

	###*
	 * Appends fulfillment and rejection handlers to the promise,
	 * and returns a new promise resolving to the return value of the called handler.
	 * @param  {Function} onFulfilled Optional. Called when the Promise is resolved.
	 * @param  {Function} onRejected  Optional. Called when the Promise is rejected.
	 * @return {Promise} It will return a new Promise which will resolve or reject after
	 * the current Promise.
	###
	then: (onFulfilled, onRejected) ->
		@_fulfillHandlers.push onFulfilled

		newPromise @

	catch: (onRejected) ->

	@all = (iterable) ->

	@race = (iterable) ->

	@reject = (reason) ->

	@resolve = (value) ->

# ********************** Private **********************

	###
		'Function.prototype.bind' is slow, so we use Python
		style "self" with curry and closure.
	###

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