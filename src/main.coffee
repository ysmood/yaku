

module.exports = class Promise

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
		@_handlers = []

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
		self = @

		new Promise (resolve, reject) ->
			addTrigger self, onFulfilled, resolve, onRejected, reject

	catch: (onRejected) ->

	@all = (iterable) ->

	@race = (iterable) ->

	@reject = (reason) ->

	@resolve = (value) ->

# ********************** Private **********************

	###
		'bind' and 'call' is slow, so we use Python
		style "self" with curry and closure.
		See: http://jsperf.com/call-vs-arguments
	###

	# These are some static symbols.
	# The state value is designed to be 0, 1, 2. Not by chance.
	# See the genTrigger part's selector.
	$resolved = 0
	$pending = 1
	$rejected = 2

	_state: $pending
	_value: null

	# For better performance, the array is like below,
	# every four callback are paired together as a group:
	# [ onFulfilled, resolve, onRejected, reject, ... ]
	_handlers: []

	_thenCount: 0

	nextTick = do ->
		(fn) ->
			process.nextTick fn

	run = (self, executor) -> nextTick ->
		executor genTrigger(self, $resolved),
			genTrigger(self, $rejected)

	addTrigger = (self, onFulfilled, resolve, onRejected, reject) ->
		switch self._state
			when $pending
				self._thenCount++
				self._handlers.splice self._handlers - 1, 0,
					onFulfilled, resolve, onRejected, reject

			when $resolved
				chainHandler self._value, onFulfilled, resolve

			when $rejected
				chainHandler self._value, onRejected, reject

	chainHandler = (value, handler, thenHandler) ->
		out = handler value

		if out and typeof out.then == 'function'
			out.then thenHandler
		else
			thenHandler out

	genTrigger = (self, state) -> (value) ->
		if self._state != $pending
			return

		self._state = state
		self._value = value
		i = 0

		while i < self._thenCount
			# Trick: we reuse the value of state as the handler selector.
			k = i++ * 4 + state

			chainHandler value, self._handlers[k], self._handlers[k + 1]

		return
