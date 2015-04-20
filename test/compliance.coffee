promisesAplusTests = require 'promises-aplus-tests'
Promise = require('../src/yaku')
# Promise = require('es6-promise').Promise
# Promise = require('bluebird')
# Promise = require('q').Promise

module.exports = (opts) ->

	adapter = {
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