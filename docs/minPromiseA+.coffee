###*
 * Before reading this source file, open web page [Promises/A+](https://promisesaplus.com).
###

class Yaku

	###*
	 * This class follows the [Promises/A+](https://promisesaplus.com) and
	 * [ES6](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-promise-objects) spec
	 * with some extra helpers.
	 * @param  {Function} executor Function object with two arguments resolve and reject.
	 * The first argument fulfills the promise, the second argument rejects it.
	 * We can call these functions, once our operation is completed.
	###
	constructor: (executor) ->
		executor genSettler(@, $resolved), genSettler(@, $rejected)

	###*
	 * Appends fulfillment and rejection handlers to the promise,
	 * and returns a new promise resolving to the return value of the called handler.
	 * @param  {Function} onFulfilled Optional. Called when the Promise is resolved.
	 * @param  {Function} onRejected  Optional. Called when the Promise is rejected.
	 * @return {Yaku} It will return a new Yaku which will resolve or reject after
	 * the current Promise.
	###
	then: (onFulfilled, onRejected) ->
		addHandler @, new Yaku(->), onFulfilled, onRejected

# ********************** Private **********************

	###
	 * All static variable name will begin with `$`. Such as `$rejected`.
	 * @private
	###

	###*
	 * These are some static symbolys.
	 * @private
	###
	$rejected = 0
	$resolved = 1
	$pending = 2

	# Default state
	_state: $pending

	###*
	 * The number of current promises that attach to this Yaku instance.
	 * @private
	###
	_pCount: 0


	# *************************** Promise Hepers ****************************

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
		if typeof onFulfilled == 'function'
			p2._onFulfilled = onFulfilled
		if typeof onRejected == 'function'
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
	scheduleHandler = (p1, p2) -> setTimeout ->
		handler = if p1._state then p2._onFulfilled else p2._onRejected

		# 2.2.7.3
		# 2.2.7.4
		if handler == undefined
			settlePromise p2, p1._state, p1._value
			return

		try
			# 2.2.5
			x = handler p1._value
		catch e
			# 2.2.7.2
			settlePromise p2, $rejected, e
			return

		# 2.2.7.1
		settleWithX p2, x

		return

	###*
	 * Resolve or reject a promise.
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

		# 2.2.2
		# 2.2.3
		while i < len
			# 2.2.4
			scheduleHandler p, p[i++]

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
			settlePromise p, $rejected, new TypeError 'promise_circular_chain'
			return

		# 2.3.2
		# 2.3.3
		type = typeof x
		if x != null and (type == 'function' or type == 'object')
			try
				# 2.3.2.1
				xthen = x.then
			catch e
				# 2.3.3.2
				settlePromise p, $rejected, e
				return

			if typeof xthen == 'function'
				settleXthen p, x, xthen
			else
				# 2.3.3.4
				settlePromise p, $resolved, x
		else
			# 2.3.4
			settlePromise p, $resolved, x

		p

	###*
	 * Resolve then with its promise.
	 * @private
	 * @param  {Yaku} p
	 * @param  {Thenable} x
	 * @param  {Function} xthen
	###
	settleXthen = (p, x, xthen) ->
		try
			# 2.3.3.3
			xthen.call x, (y) ->
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
		catch e
			# 2.3.3.3.4.1
			if x
				# 2.3.3.3.4.2
				settlePromise p, $rejected, e
				x = null

		return

	module.exports = Yaku
