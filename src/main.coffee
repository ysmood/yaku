
module.exports = class Promise
	statePending = 0
	stateResolved = 1
	stateRejected = 2

	nextTick = (fn) ->
		process.nextTick fn

	constructor: (executor) ->
		self = @
		@_state = statePending
		@_value = null

		@_fulfillHandlers = []
		@_rejectHandlers =[]

		nextTick ->
			executor self._resolve.bind(self),
				self._reject.bind(self)

	then: (onFulfilled, onRejected) ->
		self = @
		@_fulfillHandlers.push onFulfilled

		new Promise (resolve, reject) ->
			self._fulfillHandlers.push resolve

	catch: (onRejected) ->

	@all: (iterable) ->

	@race: (iterable) ->

	@reject: (reason) ->

	@resolve: (value) ->

# ********************** Private **********************

	_reject: (reason) ->
		@_state = stateRejected
		@_value = reason

	_resolve: (result) ->
		@_state = stateResolved
		@_value = result

		for handler in @_fulfillHandlers
			handler result

		return
