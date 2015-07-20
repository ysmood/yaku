

class Yaku
	'use strict'

	$nil = undefined

	root = if typeof global == 'object'
		global
	else
		window

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
		if isLongStackTrace
			@[$promiseTrace] = genTraceInfo()

		return if executor == $noop

		err = genTryCatcher(executor)(
			genSettler(@, $resolved),
			genSettler(@, $rejected)
		)

		if err == $tryErr
			settlePromise @, $rejected, err.e

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
		@then $nil, onRejected

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
	 * Catch all possibly unhandled rejections. If you want to use specific
	 * format to display the error stack, overwrite it.
	 * If it is set, auto `console.error` unhandled rejection will be disabed.
	 * @param {Any} reason The rejection reason.
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * Promise.onUnhandledRejection = (reason) ->
	 * 	console.error reason
	 *
	 * # The console will log an unhandled rejection error message.
	 * Promise.reject('my reason')
	 *
	 * # The below won't log the unhandled rejection error message.
	 * Promise.reject('v').catch ->
	 * ```
	###
	@onUnhandledRejection: (reason, p) ->
		return if not isObject console

		info = genStackInfo reason, p
		console.error 'Unhandled Rejection:', info[0], info[1]

	isLongStackTrace = false

	###*
	 * It is used to enable the long stack trace.
	 * Once it is enabled, it can't be reverted.
	 * While it is very helpful in development and testing environments,
	 * it is not recommended to use it in production. It will slow down your
	 * application and waste your memory.
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * Promise.enableLongStackTrace()
	 * ```
	###
	@enableLongStackTrace: ->
		isLongStackTrace = true
		return

	###*
	 * Only Node has `process.nextTick` function. For browser there are
	 * so many ways to polyfill it. Yaku won't do it for you, instead you
	 * can choose what you prefer. For example, this project
	 * [setImmediate](https://github.com/YuzuJS/setImmediate).
	 * By default, Yaku will use `process.nextTick` on Node, `setTimeout` on browser.
	 * @type {Function}
	 * @example
	 * ```coffee
	 * Promise = require 'yaku'
	 * Promise.nextTick = window.setImmediate
	 * ```
	###
	@nextTick: $nil

# ********************** Private **********************

	###
	 * All static variable name will begin with `$`. Such as `$rejected`.
	 * @private
	###

	# ******************************* Utils ********************************

	$tryCatchFn = null
	$tryErr = { e: null }
	$noop = {}

	isObject = (obj) ->
		typeof obj == 'object'

	isFunction = (obj) ->
		typeof obj == 'function'

	###*
	 * Release the specified key of an object.
	 * @private
	 * @param  {Object} obj
	 * @param  {String | Number} key
	###
	release = (obj, key) ->
		obj[key] = $nil
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
				fn fnQueue[i]
				release fnQueue, i++

			fnQueueLen = 0
			fnQueue.length = initQueueSize

			return

		###*
		 * Schedule a flush task on the next tick.
		 * @private
		 * @param {Function} fn The flush task.
		###
		Yaku.nextTick = try
			root.process.nextTick
		catch
			setTimeout.bind root

		(v) ->
			fnQueue[fnQueueLen++] = v

			Yaku.nextTick flush if fnQueueLen == 1

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

	genTraceInfo = (noTitle) ->
		(new Error).stack
			.replace 'Error',
				(if noTitle then '' else $fromPrevious)

	# ************************** Promise Constant **************************

	###*
	 * These are some static symbolys.
	 * @private
	###
	$rejected = 0
	$resolved = 1
	$pending = 2

	$promiseTrace = '_pStack'
	$settlerTrace = '_sStack'

	# These are some symbols. They won't be used to store data.
	$circularChain = 'promise_circular_chain'

	$invalid_argument = 'invalid_argument'

	$fromPrevious = 'From previous event:'

	# Default state
	_state: $pending

	###*
	 * The number of current promises that attach to this Yaku instance.
	 * @private
	###
	_pCount: 0

	_pre: null

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
		if isLongStackTrace
			self[$settlerTrace] = genTraceInfo(true)

		if (state == $resolved)
			settleWithX self, value
		else
			settlePromise self, state, value

		return

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
		if isFunction onFulfilled
			p2._onFulfilled = onFulfilled
		if isFunction onRejected
			p2._onRejected = onRejected

		p2._pre = p1
		p1[p1._pCount++] = p2

		# 2.2.6
		if p1._state != $pending and p1._pCount > 0
			scheduleHandler p1

		# 2.2.7
		p2

	###*
	 * Resolve the value returned by onFulfilled or onRejected.
	 * @private
	 * @param {Yaku} p1
	 * @param {Yaku} p2
	###
	scheduleHandler = genScheduler 999, (p1) ->
		i = 0
		len = p1._pCount

		while i < len
			p2 = p1[i++]

			continue if p2._state != $pending

			# 2.2.2
			# 2.2.3
			handler = if p1._state then p2._onFulfilled else p2._onRejected

			# 2.2.7.3
			# 2.2.7.4
			if handler == $nil
				settlePromise p2, p1._state, p1._value
				continue

			# 2.2.7.1
			x = genTryCatcher(callHanler) handler, p1._value
			if x == $tryErr
				# 2.2.7.2
				settlePromise p2, $rejected, x.e
				continue

			settleWithX p2, x

		return

	# Why are there two "genScheduler"s?
	# Well, to support the babel's es7 async-await polyfill, I have to hack it.
	scheduleUnhandledRejection = genScheduler 9, (genScheduler 9, (p) ->
		# iter tree
		hasHandler = (node) ->
			i = 0
			len = node._pCount

			while i < len
				child = node[i++]
				return true if child._onRejected
				return true if hasHandler child

			return

		if not hasHandler p
			Yaku.onUnhandledRejection p._value, p

		return
	)

	genStackInfo = (reason, p) ->
		stackInfo = []

		trim = (str) -> str.replace /^\s+|\s+$/g, ''

		if isLongStackTrace and p[$promiseTrace]
			push = (trace) ->
				stackInfo.push trim trace

			if p[$settlerTrace]
				push p[$settlerTrace]

			# Hope you guys could understand how the back trace works.
			# We only have to iter through the tree from the bottom to root.
			iter = (node) ->
				return if not node
				iter node._next
				push node[$promiseTrace]
				iter node._pre

			iter p

		stackStr = '\n' + stackInfo.join('\n')

		clean = (stack, cleanPrev) ->
			if cleanPrev and (i = stack.indexOf('\n' + $fromPrevious)) > 0
				stack = stack.slice 0, i

			if typeof __filename == 'string'
				stack.replace ///.+#{__filename}.+\n?///g, ''

		return [(
			if reason
				if reason.stack
					clean (trim reason.stack), true
				else
					reason
			else
				reason
		), clean(stackStr)]

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

		if state == $rejected
			if isLongStackTrace and value and value.stack
				stack = genStackInfo value, p
				value.stack = stack[0] + stack[1]

			scheduleUnhandledRejection p

		if not isLongStackTrace
			p._pre = $nil

		# 2.2.4
		scheduleHandler p if p._pCount > 0

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
			settlePromise p, $rejected, genTypeError($circularChain)
			return

		# 2.3.2
		# 2.3.3
		if x != null and (isFunction(x) or isObject(x))
			# 2.3.2.1
			xthen = genTryCatcher(getThen) x

			if xthen == $tryErr
				# 2.3.3.2
				settlePromise p, $rejected, xthen.e
				return

			if isFunction xthen
				if isLongStackTrace and x instanceof Yaku
					p._next = x

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
			root.Yaku = Yaku
