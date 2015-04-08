

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

		if @_state == $pending
			@_thenIndex++

		thenIndex = @_thenIndex

		addHandler self, thenIndex, onFulfilled, onRejected

		new Promise (resolve, reject) ->
			chainHandlers self, thenIndex, resolve, reject

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

	# These are some static symbolys.
	# The state value is designed to be 0, 1, 2. Not by chance.
	# See the genTrigger part's selector.
	$resolved = 0
	$rejected = 1
	$pending = 2

	_state: $pending
	_value: null

	# For better performance, the array is like below,
	# every 6 entities are paired together as a group:
	#   0            1           2        3
	# [ onFulfilled, onRejected, resolve, reject, ... ]
	_handlers: []

	_thenIndex: 0

	nextTick = do ->
		(fn) ->
			process.nextTick fn

	run = (self, executor) -> nextTick ->
		executor genTrigger(self, $resolved),
			genTrigger(self, $rejected)
		return

	addHandler = (self, thenIndex, onFulfilled, onRejected) ->
		switch self._state
			when $pending
				self._handlers.splice self._handlers.length, 0,
					onFulfilled, onRejected

			when $resolved
				self._handlers[thenIndex * 4] = onFulfilled self._value

			when $rejected
				self._handlers[thenIndex * 4 + 1] = onRejected self._value
		return

	chainHandlers = (self, thenIndex, resolve, reject) ->
		switch self._state
			when $pending
				self._handlers.splice thenIndex * 4 + 2, 0,
					resolve, reject

			when $resolved
				chainHandler self._handlers[thenIndex * 4], 0, resolve

			when $rejected
				chainHandler self._handlers[thenIndex * 4 + 1], 0, reject

		return

	chainHandler = (value, handler) ->
		if value and typeof value.then == 'function'
			value.then handler
		else
			handler value
		return

	genTrigger = (self, state) -> (value) ->
		if self._state != $pending
			return

		self._state = state
		self._value = value
		i = 0
		len = self._thenIndex

		while i < len
			# Trick: Reuse the value of state as the handler selector.
			k = i++ * 4 + state

			handler = self._handlers[k]
			thenHandler = self._handlers[k + 2]

			if thenHandler
				chainHandler handler(value), thenHandler
			else
				self._handlers[k] = handler value

		return
