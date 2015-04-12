promisesAplusTests = require 'promises-aplus-tests'
Promise = require '../src/yaku'

adapter = {
	resolved: Promise.resolve

	rejected: Promise.reject

	deferred: ->
		defer = {}

		defer.promise = new Promise (resolve, reject) ->
			defer.resolve = resolve
			defer.reject = reject

		defer
}

promisesAplusTests adapter, (err) ->
	if err
		process.exit 1