promisesAplusTests = require 'promises-aplus-tests'
Promise = require '../src/yaku'

module.exports = (opts) ->

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

	promisesAplusTests adapter, opts, (err) ->
		if err
			process.exit 1