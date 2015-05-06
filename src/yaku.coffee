

do (root = this) -> class Yaku

	###*
	 * This class follows the [Promises/A+](https://promisesaplus.com) and
	 * [ES6](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects) spec
	 * with some extra helpers.
	 * @param  {Function} executor Function object with two arguments resolve and reject.
	 * The first argument fulfills the promise, the second argument rejects it.
	 * We can call these functions, once our operation is completed.
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * p = new Promise (resolve, reject) ->
	 * 	setTimeout ->
	 * 		if Math.random() > 0.5
	 * 			resolve 'ok'
	 * 		else
	 * 			reject 'no'
	 * ```
	###
	constructor: (executor) ->
		return if executor == $noop
		executor genSettler(@, $resolved), genSettler(@, $rejected)

	###*
	 * Appends fulfillment and rejection handlers to the promise,
	 * and returns a new promise resolving to the return value of the called handler.
	 * @param  {Function} onFulfilled Optional. Called when the Promise is resolved.
	 * @param  {Function} onRejected  Optional. Called when the Promise is rejected.
	 * @return {Yaku} It will return a new Yaku which will resolve or reject after
	 * @example
	 * the current Promise.
	 * ```coffee
	 * Promise = require 'yaku'
	 * p = Promise.resolve 10
	 *
	 * p.then (v) ->
	 * 	console.log v
	 * ```
	###
	then: (onFulfilled, onRejected) ->
		addHandler @, newEmptyYaku(), onFulfilled, onRejected

	###*
	 * The `catch()` method returns a Promise and deals with rejected cases only.
	 * It behaves the same as calling `Promise.prototype.then(undefined, onRejected)`.
	 * @param  {Function} onRejected A Function called when the Promise is rejected.
	 * This function has one argument, the rejection reason.
	 * @return {Yaku} A Promise that deals with rejected cases only.
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * p = Promise.reject 10
	 *
	 * p.catch (v) ->
	 * 	console.log v
	 * ```
	###
	catch: (onRejected) ->
		@then undefined, onRejected

	###*
	 * The `Promise.resolve(value)` method returns a Promise object that is resolved with the given value.
	 * If the value is a thenable (i.e. has a then method), the returned promise will "follow" that thenable,
	 * adopting its eventual state; otherwise the returned promise will be fulfilled with the value.
	 * @param  {Any} value Argument to be resolved by this Promise.
	 * Can also be a Promise or a thenable to resolve.
	 * @return {Yaku}
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * p = Promise.resolve 10
	 * ```
	###
	@resolve: (value) ->
		return value if value instanceof Yaku
		settleWithX newEmptyYaku(), value

	###*
	 * The `Promise.reject(reason)` method returns a Promise object that is rejected with the given reason.
	 * @param  {Any} reason Reason why this Promise rejected.
	 * @return {Yaku}
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * p = Promise.reject 10
	 * ```
	###
	@reject: (reason) ->
		settlePromise newEmptyYaku(), $rejected, reason

	###*
	 * The `Promise.race(iterable)` method returns a promise that resolves or rejects
	 * as soon as one of the promises in the iterable resolves or rejects,
	 * with the value or reason from that promise.
	 * @param  {iterable} iterable An iterable object, such as an Array.
	 * @return {Yaku} The race function returns a Promise that is settled
	 * the same way as the first passed promise to settle.
	 * It resolves or rejects, whichever happens first.
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * Promise.race [
	 * 	123
	 * 	Promise.resolve 0
	 * ]
	 * .then (value) ->
	 * 	console.log value # => 123
	 * ```
	###
	@race: (iterable) ->
		assertIterable iterable

		len = iterable.length

		if len == 0
			return Yaku.resolve []

		p = newEmptyYaku()
		i = 0
		while i < len
			settleWithX p, iterable[i++]
			break if p._state != $pending
		p

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
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * Promise.all [
	 * 	123
	 * 	Promise.resolve 0
	 * ]
	 * .then (values) ->
	 * 	console.log values # => [123, 0]
	 * ```
	###
	@all: (iterable) ->
		assertIterable iterable

		convertor = Yaku.resolve
		len = countDown = iterable.length

		if len == 0
			return convertor []

		p1 = newEmptyYaku()
		res = []
		i = 0

		onRejected = (reason) ->
			settlePromise p1, $rejected, reason
			return

		iter = (i) ->
			convertor(iterable[i]).then (value) ->
				res[i] = value
				if not --countDown
					settlePromise p1, $resolved, res
				return
			, onRejected

			return

		while i < len
			iter i++

		p1

	###*
	 * Catch all possibly unhandled rejections.
	 * If it is set, auto `console.error` unhandled rejection will be disabed.
	 * @param {Any} reason The rejection reason.
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * Promise.onUnhandledRejection = (reason) ->
	 * 	console.error reason
	 * ```
	###
	@onUnhandledRejection: (reason) ->
		if typeof console == $object
			console.error 'Unhandled rejection Error:', reason
			console.trace() if $isNode
		return


# ********************** Private **********************

	###
	 * All static variable name will begin with `$`. Such as `$rejected`.
	 * @private
	###

	# ******************************* Utils ********************************

	$tryCatchFn = null
	$tryErr = { e: null }
	$noop = {}
	$function = 'function'
	$object = 'object'
	$isNode = typeof process == $object

	###*
	 * Release the specified key of an object.
	 * @private
	 * @param  {Object} obj
	 * @param  {String | Number} key
	###
	release = (obj, key) ->
		obj[key] = undefined
		return

	###*
	 * Wrap a function into a try-catch.
	 * @private
	 * @return {Any | $tryErr}
	###
	tryCatcher = ->
		try
			$tryCatchFn.apply @, arguments
		catch e
			$tryErr.e = e
			$tryErr

	###*
	 * Generate a try-catch wrapped function.
	 * @private
	 * @param  {Function} fn
	 * @return {Function}
	###
	genTryCatcher = (fn) ->
		$tryCatchFn = fn
		tryCatcher

	###*
	 * Generate a scheduler.
	 * @private
	 * @param  {Integer}  initQueueSize
	 * @param  {Function} fn `(Yaku, Value) ->` The schedule handler.
	 * @return {Function} `(Yaku, Value) ->` The scheduler.
	###
	genScheduler = (initQueueSize, fn) ->
		###*
		 * All async promise will be scheduled in
		 * here, so that they can be execute on the next tick.
		 * @private
		###
		fnQueue = Array initQueueSize
		fnQueueLen = 0

		###*
		 * Run all queued functions.
		 * @private
		###
		flush = ->
			i = 0
			while i < fnQueueLen
				pIndex = i++
				vIndex = i++

				p = fnQueue[pIndex]
				v = fnQueue[vIndex]

				release fnQueue, pIndex
				release fnQueue, vIndex

				fn p, v

			fnQueueLen = 0
			fnQueue.length = initQueueSize

			return

		###*
		 * Schedule a flush task on the next tick.
		 * @private
		 * @param {Function} fn The flush task.
		###
		scheduleFlush = do ->
			doc = root.document

			try
				nextTick = process.nextTick
				return ->
					nextTick flush
					return

			if nextTick = root.setImmediate
				->
					nextTick flush
					return

			else if mutationObserver = root.MutationObserver
				content = 1
				node = doc.createTextNode ''
				observer = new mutationObserver flush
				observer.observe node, characterData: true
				->
					node.data = (content = -content)
					return

			else
				->
					setTimeout flush
					return

		(p, v) ->
			fnQueue[fnQueueLen++] = p
			fnQueue[fnQueueLen++] = v

			scheduleFlush() if fnQueueLen == 2

			return

	###*
	 * Check if a variable is an iterable object.
	 * @private
	 * @param  {Any}  obj
	 * @return {Boolean}
	###
	assertIterable = (obj) ->
		return if obj instanceof Array
		throw genTypeError $invalid_argument

	###*
	 * Generate type error object.
	 * @private
	 * @param  {String} msg
	 * @return {TypeError}
	###
	genTypeError = (msg) ->
		new TypeError msg

	# ************************** Promise Constant **************************

	###*
	 * These are some static symbolys.
	 * @private
	###
	$rejected = 0
	$resolved = 1
	$pending = 2

	$unhandledRejection = -1

	# These are some symbols. They won't be used to store data.
	$circularError = 'circular promise chain'

	$invalid_argument = 'invalid_argument'

	# Default state
	_state: $pending

	###*
	 * The number of current promises that attach to this Yaku instance.
	 * @private
	###
	_pCount: 0

	Yaku::[$unhandledRejection] = true


	# *************************** Promise Hepers ****************************

	###*
	 * Create an empty promise.
	 * @private
	 * @return {Yaku}
	###
	newEmptyYaku = -> new Yaku $noop

	###*
	 * It will produce a settlePromise function to user.
	 * Such as the resolve and reject in this `new Yaku (resolve, reject) ->`.
	 * @private
	 * @param  {Yaku} self
	 * @param  {Integer} state The value is one of `$pending`, `$resolved` or `$rejected`.
	 * @return {Function} `(value) -> undefined` A resolve or reject function.
	###
	genSettler = (self, state) -> (value) ->
		settlePromise self, state, value

	###*
	 * Link the promise1 to the promise2.
	 * @private
	 * @param {Yaku} p1
	 * @param {Yaku} p2
	 * @param {Function} onFulfilled
	 * @param {Function} onRejected
	###
	addHandler = (p1, p2, onFulfilled, onRejected) ->
		# 2.2.1
		if typeof onFulfilled == $function
			p2._onFulfilled = onFulfilled
		if typeof onRejected == $function
			p1[$unhandledRejection] = false
			p2._onRejected = onRejected

		# 2.2.6
		if p1._state == $pending
			p1[p1._pCount++] = p2
		else
			scheduleHandler p1, p2

		# 2.2.7
		p2

	###*
	 * Resolve the value returned by onFulfilled or onRejected.
	 * @private
	 * @param {Yaku} p1
	 * @param {Yaku} p2
	###
	scheduleHandler = genScheduler 1000, (p1, p2) ->
		handler = if p1._state then p2._onFulfilled else p2._onRejected

		# 2.2.7.3
		# 2.2.7.4
		if handler == undefined
			settlePromise p2, p1._state, p1._value
			return

		# 2.2.7.1
		x = genTryCatcher(callHanler) handler, p1._value
		if x == $tryErr
			# 2.2.7.2
			settlePromise p2, $rejected, x.e
			return

		settleWithX p2, x

		return

	scheduleUnhandledRejection = genScheduler 100, (p) ->
		if p[$unhandledRejection]
			Yaku.onUnhandledRejection p._value
		return

	callHanler = (handler, value) ->
		# 2.2.5
		handler value

	###*
	 * Resolve or reject a promise.
	 * @private
	 * @param  {Yaku} p
	 * @param  {Integer} state
	 * @param  {Any} value
	###
	settlePromise = (p, state, value) ->
		# 2.1.2
		# 2.1.3
		return if p._state != $pending

		# 2.1.1.1
		p._state = state
		p._value = value

		i = 0
		len = p._pCount

		if state == $rejected and not len
			scheduleUnhandledRejection p

		# 2.2.2
		# 2.2.3
		while i < len
			# 2.2.4
			scheduleHandler p, p[i]
			release p, i++

		p

	###*
	 * Resolve or reject primise with value x. The x can also be a thenable.
	 * @private
	 * @param {Yaku} p
	 * @param {Any | Thenable} x A normal value or a thenable.
	###
	settleWithX = (p, x) ->
		# 2.3.1
		if x == p and x
			settlePromise p, $rejected, genTypeError($circularError)
			return

		# 2.3.2
		# 2.3.3
		type = typeof x
		if x != null and (type == $function or type == $object)
			# 2.3.2.1
			xthen = genTryCatcher(getThen) x

			if xthen == $tryErr
				# 2.3.3.2
				settlePromise p, $rejected, xthen.e
				return

			if typeof xthen == $function
				settleXthen p, x, xthen
			else
				# 2.3.3.4
				settlePromise p, $resolved, x
		else
			# 2.3.4
			settlePromise p, $resolved, x

		p

	###*
	 * Try to get a promise's then method.
	 * @private
	 * @param  {Thenable} x
	 * @return {Function}
	###
	getThen = (x) -> x.then

	###*
	 * Resolve then with its promise.
	 * @private
	 * @param  {Yaku} p
	 * @param  {Thenable} x
	 * @param  {Function} xthen
	###
	settleXthen = (p, x, xthen) ->
		# 2.3.3.3
		err = genTryCatcher(xthen).call x, (y) ->
			# 2.3.3.3.3
			return if not x
			x = null

			# 2.3.3.3.1
			settleWithX p, y
			return
		, (r) ->
			# 2.3.3.3.3
			return if not x
			x = null

			# 2.3.3.3.2
			settlePromise p, $rejected, r
			return

		# 2.3.3.3.4.1
		if err == $tryErr and x
			# 2.3.3.3.4.2
			settlePromise p, $rejected, err.e
			x = null

		return

	# CMD & AMD Support
	try
		module.exports = Yaku
	catch
		try
			define -> Yaku
		catch
			window.Yaku = Yaku
