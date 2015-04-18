

do -> class Yaku

	###*
	 * This class follows the [Promises/A+](https://promisesaplus.com) and
	 * [ES6](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects) spec
	 * with some extra helpers.
	 * @param  {Function} executor Function object with two arguments resolve and reject.
	 * The first argument fulfills the promise, the second argument rejects it.
	 * We can call these functions, once our operation is completed.
	###
	constructor: (executor) ->
		executor genTrigger(@, $resolved), genTrigger(@, $rejected)

	###*
	 * Appends fulfillment and rejection handlers to the promise,
	 * and returns a new promise resolving to the return value of the called handler.
	 * @param  {Function} onFulfilled Optional. Called when the Promise is resolved.
	 * @param  {Function} onRejected  Optional. Called when the Promise is rejected.
	 * @return {Yaku} It will return a new Yaku which will resolve or reject after
	 * the current Promise.
	###
	then: (onFulfilled, onRejected) ->
		self = @

		newYaku = @_hCount + 4

		@[newYaku] = new Yaku (resolve, reject) ->
			addHandler self, onFulfilled, onRejected, resolve, reject


# ********************** Private **********************

	###
	 * 'bind' and 'call' is slow, so we use Python
	 * style "self" with curry and closure.
	 * See: http://jsperf.com/call-vs-arguments
	 * @private
	###

	# ************************ Private Constant Start *************************

	###*
	 * These are some static symbolys.
	 * The state value is designed to be 0, 1, 2. Not by chance.
	 * See the genTrigger part's selector.
	 * @private
	###
	$resolved = 0
	$rejected = 1
	$pending = 2

	###*
	 * This is one of the most tricky part.
	 *
	 * For better performance, both memory and speed, the array is like below,
	 * every 5 entities are paired together as a group:
	 * ```
	 *   0            1           2        3       4       ...
	 * [ onFulfilled, onRejected, resolve, reject, promise ... ]
	 * ```
	 * To save memory the position of 0 and 1 may be replaced with their returned values,
	 * then these values will be passed to 2 and 3.
	 * @private
	###
	$groupNum = 5

	$circularErrorInfo = 'circular promise resolution chain'

	# ************************* Private Constant End **************************

	_state: $pending

	###*
	 * The number of current handlers that attach to this Yaku instance.
	 * @private
	###
	_hCount: 0

	###*
	 * Create cross platform nextTick helper.
	 * @private
	 * @return {Function} `(fn) -> undefined` The fn will be called until
	 * the execution context stack contains only platform code.
	###
	nextTick =
		if process? and process.nextTick
			process.nextTick
		else
			setTimeout

	###*
	 * Push new handler to current promise.
	 * @private
	 * @param {Yaku} self
	 * @param {Function} onFulfilled It will be called when self is resolved.
	 * @param {Function} onRejected It will be called when self is rejected.
	 * @param {Function} resolve Call it to make a promise resolve.
	 * @param {Function} reject Call it to make a promise reject.
	###
	addHandler = (self, onFulfilled, onRejected, resolve, reject) ->
		offset = self._hCount
		self[offset] = onFulfilled
		self[offset + 1] = onRejected
		self[offset + 2] = resolve
		self[offset + 3] = reject
		self._hCount += $groupNum

		if self._state != $pending
			resolveHanlers self, offset

		return

	###*
	 * Resolve or reject primise with value x. The x can also be a thenable.
	 * @private
	 * @param  {Any | Thenable} x A normal value or a thenable.
	 * @param  {Function} resolve If it is called, a promise resolves.
	 * @param  {Function} reject If it is called, a promise rejects.
	###
	resolveValue = (x, resolve, reject) ->
		type = typeof x
		if x != null and (type == 'function' or type == 'object')
			try
				xthen = x.then
			catch e
				reject e
				return

			if typeof xthen == 'function'
				try
					isResolved = false
					xthen.call x, (y) ->
						return if isResolved
						isResolved = true
						resolveValue y, resolve, reject
					, (r) ->
						return if isResolved
						isResolved = true
						reject r
				catch e
					reject e if not isResolved
			else
				resolve x
		else
			resolve x if resolve

		return

	###*
	 * Decide how handlers works.
	 * @private
	 * @param  {Yaku} self
	 * @param  {Integer} offset The offset of the handler group.
	###
	resolveHanlers = (self, offset) -> nextTick ->
		# Trick: Reuse the value of state as the handler selector.
		# The "i + state" shows the math nature of promise.
		handler = self[offset + self._state]

		if typeof handler == 'function'
			try
				x = handler self._value
			catch e
				self[offset + 3] e
				return

			# Prevent circular chain.
			if x == self[offset + 4] and x
				return x[offset + 1]? new TypeError $circularErrorInfo

			resolveValue x, self[offset + 2],
					self[offset + 3]
		else
			self[offset + 2 + self._state] self._value

		return

	###*
	 * It will produce a trigger function to user.
	 * Such as the resolve and reject in this `new Yaku (resolve, reject) ->`.
	 * @private
	 * @param  {Yaku} self
	 * @param  {Integer} state The value is one of `$pending`, `$resolved` or `$rejected`.
	 * @return {Function} `(value) -> undefined` A resolve or reject function.
	###
	genTrigger = (self, state) -> (value) ->
		return if self._state != $pending

		self._state = state
		self._value = value

		offset = 0

		while offset < self._hCount
			resolveHanlers self, offset

			offset += $groupNum

		return

	# AMD Support
	if typeof module == 'object' and typeof module.exports == 'object'
		module.exports = Yaku
	else
		# CMD
		if typeof define == 'function' and define.amd
			define -> Yaku
		else
			window?.Yaku = Yaku
