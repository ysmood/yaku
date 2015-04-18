

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
		self = @

		executor (val) ->
			self._trigger $resolved, val
		, (val) ->
			self._trigger $rejected, val

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

		hGroup = [onFulfilled, onRejected]

		@[@_hCount++] = hGroup

		hGroup[4] = new Yaku (resolve, reject) ->
			hGroup[2] = resolve
			hGroup[3] = reject

			if self._state != $pending
				self._resolveHanlers hGroup

			return

	###*
	 * The catch() method returns a Promise and deals with rejected cases only.
	 * It behaves the same as calling `Promise.prototype.then(undefined, onRejected)`.
	 * @param  {Function} onRejected A Function called when the Promise is rejected.
	 * This function has one argument, the rejection reason.
	 * @return {Yaku} A Promise that deals with rejected cases only.
	###
	catch: (onRejected) ->
		@then undefined, onRejected

	###*
	 * The Promise. resolve(value) method returns a Promise object that is resolved with the given value.
	 * If the value is a thenable (i.e. has a then method), the returned promise will "follow" that thenable,
	 * adopting its eventual state; otherwise the returned promise will be fulfilled with the value.
	 * @param  {Any} value Argument to be resolved by this Promise.
	 * Can also be a Promise or a thenable to resolve.
	 * @return {Yaku}
	###
	@resolve: (value) ->
		new Yaku (resolve, reject) ->
			resolveValue value, resolve, reject
			return

	###*
	 * The Promise.reject(reason) method returns a Promise object that is rejected with the given reason.
	 * @param  {Any} reason Reason why this Promise rejected.
	 * @return {Yaku}
	###
	@reject: (reason) ->
		new Yaku (nil, reject) ->
			reject reason
			return

	###*
	 * The Promise.race(iterable) method returns a promise that resolves or rejects
	 * as soon as one of the promises in the iterable resolves or rejects,
	 * with the value or reason from that promise.
	 * @param  {iterable} iterable An iterable object, such as an Array.
	 * @return {Yaku} The race function returns a Promise that is settled
	 * the same way as the first passed promise to settle.
	 * It resolves or rejects, whichever happens first.
	###
	@race: (iterable) ->
		new Yaku (resolve, reject) ->
			for x in iterable
				resolveValue x, resolve, reject
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
	 * @return {Yaku}
	###
	@all: (iterable) ->
		new Yaku (resolve, reject) ->
			res = []
			countDown = iterable.length

			iter = (i) ->
				resolveValue x, (v) ->
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

	$circularErrorInfo = 'circular promise resolution chain'

	$tryErr = {}

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
		else if setImmediate?
			setImmediate
		else if CustomEvent? or (document? and document.createEvent?)
			eventName = '__yakuNextTick'
			newEvent = try
				new CustomEvent ''
				(fn) ->
					new CustomEvent eventName,
						detail: fn, bubbles: false, cancelable: false
			catch
				(fn) ->
					evt = document.createEvent 'CustomEvent'
					evt.initCustomEvent eventName, false, false, fn
					evt

			addEventListener eventName, (e) -> e.detail()
			(fn) -> dispatchEvent newEvent fn
		else
			setTimeout

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
			xthen = getXthen x, reject
			return if xthen == $tryErr

			if typeof xthen == 'function'
				resolveXthen x, xthen, resolve, reject
			else
				resolve x
		else
			resolve x if resolve

		return

	resolveXthen = (x, xthen, resolve, reject) ->
		isResolved = false

		# TODO: If the promise is a Yaku instance,
		# not some thing like the Bluebird or jQuery Defer,
		# we can do some performance optimization.
		try
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

		return

	getXthen = (x, reject) ->
		try
			x.then
		catch e
			reject e
			return $tryErr

	_getX: (hGroup, handler) ->
		try
			handler @_value
		catch e
			hGroup[3] e
			return $tryErr

	###*
	 * Decide how handlers works.
	 * @private
	 * @param  {Yaku} self
	###
	_resolveHanlers: (hGroup) ->
		# Trick: Reuse the value of state as the handler selector.
		# The "i + state" shows the math nature of promise.
		handler = hGroup[@_state]

		if typeof handler == 'function'
			self = @
			nextTick ->
				x = self._getX hGroup, handler
				return if x == $tryErr

				# Prevent circular chain.
				if x == hGroup[4] and x
					return x._trigger $rejected,
						new TypeError $circularErrorInfo

				resolveValue x, hGroup[2], hGroup[3]
		else
			hGroup[2 + @_state] @_value

		return

	_trigger: (state, value) ->
		return if @_state != $pending

		@_state = state
		@_value = value

		i = 0

		while i < @_hCount
			@_resolveHanlers @[i++]

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
