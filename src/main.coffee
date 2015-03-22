
class Promise

	###*
	 * This class follows the [Promises/A+](https://promisesaplus.com) and
	 * [ES6](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects) spec
	 * with some extra helpers.
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
		@_rejectHandlers.push onRejected

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
		executor genTrigger(self, $resolved),
			genTrigger(self, $rejected)

	newPromise = (self) -> new Promise (resolve, reject) ->
		self._fulfillHandlers.push resolve
		self._rejectHandlers.push reject

	genTrigger = (self, state) -> (result) ->
		self._state = state
		self._value = result

		handlers = if state == $resolved
			self._fulfillHandlers
		else
			self._rejectHandlers

		for handler in handlers
			handler result

		return

module.exports = Promise