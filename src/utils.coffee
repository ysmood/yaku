Promise = require './yaku'

isNumber = (obj) ->
	typeof obj == 'number'

isArray = (obj) ->
	obj instanceof Array

isFunction = (obj) ->
	typeof obj == 'function'

utils = module.exports =

	###*
	 * An throttled version of `Promise.all`, it runs all the tasks under
	 * a concurrent limitation.
	 * To run tasks sequentially, use `utils.flow`.
	 * @param  {Int} limit The max task to run at a time. It's optional.
	 * Default is `Infinity`.
	 * @param  {Array | Function} list
	 * If the list is an array, it should be a list of functions or promises,
	 * and each function will return a promise.
	 * If the list is a function, it should be a iterator that returns
	 * a promise, when it returns `utils.end`, the iteration ends. Of course
	 * it can never end.
	 * @param {Boolean} saveResults Whether to save each promise's result or
	 * not. Default is true.
	 * @param {Function} progress If a task ends, the resolved value will be
	 * passed to this function.
	 * @return {Promise}
	 * @example
	 * ```js
	 * var kit = require('nokit');
	 * var utils = require('yaku/lib/utils');
	 *
	 * var urls = [
	 *  'http://a.com',
	 *  'http://b.com',
	 *  'http://c.com',
	 *  'http://d.com'
	 * ];
	 * var tasks = [
	 *  () => kit.request(url[0]),
	 *  () => kit.request(url[1]),
	 *  () => kit.request(url[2]),
	 *  () => kit.request(url[3])
	 * ];
	 *
	 * utils.async(tasks).then(() => kit.log('all done!'));
	 *
	 * utils.async(2, tasks).then(() => kit.log('max concurrent limit is 2'));
	 *
	 * utils.async(3, () => {
	 *  var url = urls.pop();
	 *  if (url)
	 *      return kit.request(url);
	 *  else
	 *      return utils.end;
	 * })
	 * .then(() => kit.log('all done!'));
	 * ```
	###
	async: (limit, list, saveResults, progress) ->
		resutls = []
		running = 0
		isIterDone = false
		iterIndex = 0

		if not isNumber limit
			progress = saveResults
			saveResults = list
			list = limit
			limit = Infinity

		saveResults ?= true

		if isArray list
			iter = ->
				el = list[iterIndex]
				if el == undefined
					utils.end
				else if isFunction el
					el()
				else
					el

		else if isFunction list
			iter = list
		else
			return throw new TypeError 'wrong argument type: ' + list

		tryIter = ->
			try
				iter()
			catch e
				Promise.reject e

		new Promise (resolve, reject) ->
			addTask = ->
				task = tryIter()
				index = iterIndex++

				if isIterDone or task == utils.end
					isIterDone = true
					allDone() if running == 0
					return false

				if utils.isPromise(task)
					p = task
				else
					p = Promise.resolve task

				running++
				p.then (ret) ->
					running--
					if saveResults
						resutls[index] = ret
					progress? ret
					addTask()
				, (err) ->
					running--
					reject err

				return true

			allDone = ->
				if saveResults
					resolve resutls
				else
					resolve()

			i = limit
			while i--
				break if not addTask()

	###*
	 * If a function returns promise, convert it to
	 * node callback style function.
	 * @param  {Function} fn
	 * @param  {Any} self The `this` to bind to the fn.
	 * @return {Function}
	###
	callbackify: (fn, self) ->
		(args..., cb) ->
			if not isFunction cb
				args.push cb
				return fn.apply self, args

			if arguments.length == 1
				args = [cb]
				cb = null

			fn.apply self, args
			.then (val) ->
				cb? null, val
			.catch (err) ->
				if cb
					cb err
				else
					Promise.reject err

	###*
	 * Create a `jQuery.Deferred` like object.
	###
	Deferred: ->
		defer = {}

		defer.promise = new Promise (resolve, reject) ->
			defer.resolve = resolve
			defer.reject = reject

		defer

	###*
	 * The end symbol.
	 * @return {Promise} A promise that will end the current pipeline.
	###
	end: -> new Promise ->

	###*
	 * Creates a function that is the composition of the provided functions.
	 * Besides, it can also accept async function that returns promise.
	 * See `utils.async`, if you need concurrent support.
	 * @param  {Function | Array} fns Functions that return
	 * promise or any value.
	 * And the array can also contains promises or values other than function.
	 * If there's only one argument and it's a function, it will be treated as an iterator,
	 * when it returns `utils.end`, the iteration ends.
	 * @return {Function} `(val) -> Promise` A function that will return a promise.
	 * @example
	 * It helps to decouple sequential pipeline code logic.
	 * ```js
	 * var kit = require('nokit');
	 * var utils = require('yaku/lib/utils');
	 *
	 * function createUrl (name) {
	 * 	return "http://test.com/" + name;
	 * }
	 *
	 * function curl (url) {
	 * 	return kit.request(url).then((body) => {
	 * 		kit.log('get');
	 * 		return body;
	 * 	});
	 * }
	 *
	 * function save (str) {
	 * 	kit.outputFile('a.txt', str).then(() => {
	 * 		kit.log('saved');
	 * 	});
	 * }
	 *
	 * var download = utils.flow(createUrl, curl, save);
	 * // same as "download = utils.flow([createUrl, curl, save])"
	 *
	 * download('home');
	 * ```
	 * @example
	 * Walk through first link of each page.
	 * ```js
	 * var kit = require('nokit');
	 * var utils = require('yaku/lib/utils');
	 *
	 * var list = [];
	 * function iter (url) {
	 * 	if (!url) return utils.end;
	 *
	 * 	return kit.request(url)
	 * 	.then((body) => {
	 * 		list.push(body);
	 * 		var m = body.match(/href="(.+?)"/);
	 * 		if (m) return m[0];
	 * 	});
	 * }
	 *
	 * var walker = utils.flow(iter);
	 * walker('test.com');
	 * ```
	###
	flow: (fns...) -> (val) ->
		genIter = (arr) ->
			iterIndex = 0
			(val) ->
				fn = arr[iterIndex++]
				if fn == undefined
					utils.end
				else if isFunction fn
					fn val
				else
					fn

		if isArray fns[0]
			iter = genIter fns[0]
		else if fns.length == 1 and isFunction fns[0]
			iter = fns[0]
		else if fns.length > 1
			iter = genIter fns
		else
			return throw new TypeError 'wrong argument type: ' + fn

		run = (preFn) ->
			preFn.then (val) ->
				fn = iter val

				return val if fn == utils.end

				run if utils.isPromise fn
					fn
				else if isFunction fn
					Promise.resolve fn val
				else
					Promise.resolve fn

		run Promise.resolve val

	###*
	 * Check if an object is a promise-like object.
	 * @param  {Any}  obj
	 * @return {Boolean}
	###
	isPromise: (obj) ->
		obj and isFunction(obj.then)

	###*
	 * Convert a node callback style function to a function that returns
	 * promise when the last callback is not supplied.
	 * @param  {Function} fn
	 * @param  {Any} self The `this` to bind to the fn.
	 * @return {Function}
	 * @example
	 * ```js
	 * function foo (val, cb) {
	 * 	setTimeout(() => {
	 * 		cb(null, val + 1);
	 * 	});
	 * }
	 *
	 * var bar = utils.promisify(foo);
	 *
	 * bar(0).then((val) => {
	 * 	console.log val // output => 1
	 * });
	 *
	 * // It also supports the callback style.
	 * bar(0, (err, val) => {
	 * 	console.log(val); // output => 1
	 * });
	 * ```
	###
	promisify: (fn, self) ->
		(args...) ->
			if isFunction args[args.length - 1]
				return fn.apply self, args

			new Promise (resolve, reject) ->
				args.push ->
					if arguments[0]?
						reject arguments[0]
					else
						resolve arguments[1]
				fn.apply self, args

	###*
	 * Create a promise that will wait for a while before resolution.
	 * @param  {Integer} time The unit is millisecond.
	 * @param  {Any} val What the value this promise will resolve.
	 * @return {Promise}
	 * @example
	 * ```js
	 * utils.sleep(1000).then(() => console.log('after one second'));
	 * ```
	###
	sleep: (time, val) ->
		new Promise (r) ->
			setTimeout (-> r val), time

	###*
	 * Throw an error to break the program.
	 * @param  {Any} err
	 * @example
	 * ```js
	 * Promise.resolve().then(() => {
	 * 	// This error won't be caught by promise.
	 * 	utils.throw('break the program!');
	 * });
	 * ```
	###
	throw: (err) ->
		setTimeout -> throw err
		return
