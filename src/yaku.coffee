

do -> class Promise

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

		executor genTrigger(@, $resolved), genTrigger(@, $rejected)

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

		newPromise = @_thenOffset + 4

		@_handlers[newPromise] = new Promise (resolve, reject) ->
			addHandler self, onFulfilled, onRejected, resolve, reject

	###*
	 * The catch() method returns a Promise and deals with rejected cases only.
	 * It behaves the same as calling `Promise.prototype.then(undefined, onRejected)`.
	 * @param  {Function} onRejected A Function called when the Promise is rejected.
	 * This function has one argument, the rejection reason.
	 * @return {Promise} A Promise that deals with rejected cases only.
	###
	catch: (onRejected) ->
		@then undefined, onRejected

	###*
	 * The Promise.resolve(value) method returns a Promise object that is resolved with the given value.
	 * If the value is a thenable (i.e. has a then method), the returned promise will "follow" that thenable,
	 * adopting its eventual state; otherwise the returned promise will be fulfilled with the value.
	 * @param  {Any} value Argument to be resolved by this Promise.
	 * Can also be a Promise or a thenable to resolve.
	 * @return {Promise}
	###
	@resolve: (value) ->
		new Promise (resolve, reject) ->
			tryThenable value, resolve, reject
			return

	###*
	 * The Promise.reject(reason) method returns a Promise object that is rejected with the given reason.
	 * @param  {Any} reason Reason why this Promise rejected.
	 * @return {Promise}
	###
	@reject: (reason) ->
		new Promise (nil, reject) ->
			reject reason
			return

	###*
	 * The Promise.race(iterable) method returns a promise that resolves or rejects
	 * as soon as one of the promises in the iterable resolves or rejects,
	 * with the value or reason from that promise.
	 * @param  {iterable} iterable An iterable object, such as an Array.
	 * @return {Promise} The race function returns a Promise that is settled
	 * the same way as the first passed promise to settle.
	 * It resolves or rejects, whichever happens first.
	###
	@race: (iterable) ->
		new Promise (resolve, reject) ->
			for x in iterable
				tryThenable x, resolve, reject
			return

	###*
	 * The `Promise.all(iterable)` method returns a promise that resolves when
	 * all of the promises in the iterable argument have resolved.
	 *
	 * The result is passed as an array of values from all the promises.
	 * If something passed in the iterable array is not a promise,
	 * it's converted to one by Promise.resolve. If any of the passed in promises rejects,
	 * the all Promise immediately rejects with the value of the promise that rejected,
	 * discarding all the other promises whether or not they have resolved.
	 * @param  {iterable} iterable An iterable object, such as an Array.
	 * @return {Promise}
	###
	@all: (iterable) ->
		new Promise (resolve, reject) ->
			res = []
			countDown = iterable.length

			iter = (i) ->
				tryThenable x, (v) ->
					res[i] = v
					if --countDown == 0
						resolve res
				, reject

				return

			for x, i in iterable
				iter i

			return

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

	# This is one of the most tricky part.
	#
	# For better performance, both memory and speed, the array is like below,
	# every 5 entities are paired together as a group:
	# ```
	#   0            1           2        3       4       ...
	# [ onFulfilled, onRejected, resolve, reject, promise ... ]
	# ```
	# To save memory the position of 0 and 1 may be replaced with their returned values,
	# then these values will be passed to 2 and 3.
	_handlers: []
	$groupNum = 5

	# It only counts when the current promise is on pending state.
	_thenOffset: 0

	$resolveSelf = 'circular promise resolution chain'

	nextTick = do ->
		if process? and process.nextTick
			process.nextTick
		else if setImmediate?
			setImmediate
		else
			setTimeout

	tryThenable = (x, resolve, reject) ->
		if not x
			resolve x if resolve
			return

		try
			xthen = x.then
		catch e
			reject e
			return

		if typeof xthen == 'function'
			# TODO: If the promise is a Yaku instance,
			# not some thing like the Bluebird or jQuery Defer,
			# we can do some performance optimization.
			xthen.call x, resolve, reject
		else
			resolve x

		return

	# Push new handler to current promise.
	addHandler = (self, onFulfilled, onRejected, resolve, reject) ->
		offset = self._thenOffset
		self._handlers[offset] = onFulfilled
		self._handlers[offset + 1] = onRejected
		self._handlers[offset + 2] = resolve
		self._handlers[offset + 3] = reject
		self._thenOffset += $groupNum

		if self._state != $pending
			doResolve self, offset

		return

	# Chain value to a handler, then handler may be a promise or a function.
	doResolve = (self, offset) -> nextTick ->
		# Trick: Reuse the value of state as the handler selector.
		# The "i + state" shows the math nature of promise.
		handler = self._handlers[offset + self._state]

		if typeof handler == 'function'
			try
				x = handler self._value
			catch e
				self._handlers[offset + 3] e
				return

			# Prevent circular chain.
			if x == self._handlers[offset + 4]
				return x._handlers[offset + 1]? new TypeError $resolveSelf

			tryThenable x, self._handlers[offset + 2],
					self._handlers[offset + 3]
		else
			self._handlers[offset + 2 + self._state] self._value

		return

	# It will produce a trigger function to user.
	# Such as the resolve and reject in this `new Promise (resolve, reject) ->`.
	genTrigger = (self, state) -> (value) ->
		return if self._state != $pending

		self._state = state
		self._value = value

		offset = 0

		while offset < self._thenOffset
			doResolve self, offset

			offset += $groupNum

		return

	# AMD Support
	if typeof module == "object" and typeof module.exports == "object"
		module.exports = Promise
	else
		if typeof define == "function" and define.amd
			define -> Promise
		else
			window?.Promise = Promise
