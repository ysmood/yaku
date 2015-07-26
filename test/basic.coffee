# This test should work on both Nodejs and Browser.

if module? and module.exports?
	Yaku = require '../src/yaku'
	utils = require '../src/utils'
else
	Yaku = window.Yaku

log = do -> (val) ->
	if not JSON?
		JSON = stringify: (obj) -> "\"#{obj}\""

	if window?
		xhr = new XMLHttpRequest()
		xhr.open 'POST', '/log'
		xhr.send val

		elem = document.createElement 'pre'
		elem.innerText = val
		document.body.appendChild elem
	else
		console.log val

# Only one level equality.
assert = (a, b) ->
	if typeof a != 'object'
		return if a == b
			false
		else
			{ a, b }

	for k, v of a
		if b[k] != v
			return { a, b }

	return false

test = (name, shouldBe, fn) ->
	report = (res) ->
		if not res
			log "v [test] #{name}"
		else
			log """
			x [test] #{name}
				>>>>>>>> Should Equal
				#{JSON.stringify res.b}
				<<<<<<<< But Equal
				#{JSON.stringify res.a}
				>>>>>>>>
			"""
			process?.exit(1)

	out = fn()
	if out and out.then
		out.then (v) ->
			report assert v, shouldBe
		, (v) ->
			report assert v, shouldBe
	else
		report assert fn(), shouldBe

$val = { val: 'ok' }

test 'resolve', $val, ->
	new Yaku (resolve) ->
		resolve $val

test 'resolve promise like value', $val, ->
	new Yaku (resolve) ->
		resolve {
			then: (fulfil) ->
				fulfil $val
		}

test 'constructor throw', $val, ->
	new Yaku (resolve) ->
		throw $val
	.catch (e) ->
		e

test 'resolve static', $val, ->
	Yaku.resolve $val

test 'resolve promise', $val, ->
	Yaku.resolve Yaku.resolve $val

test 'reject', $val, ->
	Yaku.reject $val
	.catch (val) -> val

test 'catch', $val, ->
	new Yaku (nil, reject) ->
		reject $val
	.catch (val) -> val

test 'chain', 'ok', ->
	Yaku.resolve().then ->
		new Yaku (r) ->
			setTimeout ->
				r 'ok'
			, 10

Yaku.resolve().then ->
	test 'unhandled rejection', $val, ->
		new Yaku (r) ->
			old = Yaku.onUnhandledRejection

			Yaku.onUnhandledRejection = (reason, p) ->
				Yaku.onUnhandledRejection = old
				r reason

			Yaku.resolve().then ->
			    Yaku.reject $val

.then ->
	test 'no unhandled rejection', $val, ->
		new Yaku (resolve, reject) ->
			old = Yaku.onUnhandledRejection

			Yaku.onUnhandledRejection = (reason, p) ->
				Yaku.onUnhandledRejection = old
				reject()

			Yaku.reject().catch ->
				setTimeout ->
					resolve $val
				, 100

.then ->
	test 'unhandled rejection inside a catch', $val, ->
		new Yaku (r) ->
			old = Yaku.onUnhandledRejection

			Yaku.onUnhandledRejection = (reason, p) ->
				Yaku.onUnhandledRejection = old
				r reason

			Yaku.reject().catch ->
				Yaku.reject $val

.then ->
	test 'unhandled rejection only once', 1, ->
		old = Yaku.onUnhandledRejection

		count = 0
		Yaku.onUnhandledRejection = -> count++

		Yaku.reject().then -> $val

		new Yaku (r) ->
			setTimeout ->
				Yaku.onUnhandledRejection = old
				r(count)
			, 50

randomPromise = (i) ->
	new Yaku (r) ->
		setTimeout ->
			r(i)
		, Math.random() * 100

test 'empty all', [], ->
	Yaku.all []

test 'all', [1, 'test', 'x', 10, 0], ->
	Yaku.all [
		randomPromise 1
		randomPromise 'test'
		Yaku.resolve 'x'
		new Yaku (r) ->
			setTimeout ->
				r 10
			, 10
		new Yaku (r) -> r 0
	]

test 'empty race', [], ->
	Yaku.race []

test 'race', 0, ->
	Yaku.race [
		new Yaku (r) ->
			setTimeout ->
				r 0
			, 20
		new Yaku (r) ->
			setTimeout ->
				r 1
			, 30
	]

if utils

	test 'async array', [0, null, undefined, 1, 2, 3], ->
		list = [
			-> 0
			-> null
			-> undefined
			-> utils.sleep 20, 1
			-> utils.sleep 10, 2
			-> utils.sleep 10, 3
		]

		utils.async 2, list

	test 'async error', $val, ->
		list = [
			-> utils.sleep 10, 1
			-> throw $val
			-> utils.sleep 10, 3
		]

		utils.async 2, list
		.catch (err) -> err

	test 'async iter progress', 10, ->
		iter = ->
			i = 0
			->
				if i++ == 10
					return utils.end
				new Yaku (r) ->
					setTimeout (-> r 1), 10

		count = 0
		utils.async 3, iter(), false, (ret) ->
			count += ret
		.then -> count

	test 'flow array', 'bc', ->
		(utils.flow [
			'a'
			Promise.resolve 'b'
			(v) -> v + 'c'
		])(0)

	test 'flow error', $val, ->
		(utils.flow [
			'a'
			Promise.resolve 'b'
			(v) -> throw $val
		])(0).catch (err) -> err

	test 'flow iter', [0, 1, 2, 3], ->
		list = []
		(utils.flow (v) ->
			return utils.end if v == 3
			Yaku.resolve().then ->
				list.push v
				++v
		)(0)
		.then (v) ->
			list.push v
			list

	test 'promisify promise', 1, ->
		fn = utils.promisify (val, cb) ->
			setTimeout ->
				cb null, val + 1

		fn 0

	test 'promisify callback', 1, ->
		fn = utils.promisify (val, cb) ->
			setTimeout ->
				cb null, val + 1

		new Promise (r) ->
			fn 0, (err, val) ->
				r val
