

Yaku = if module? and module.exports?
	require '../src/yaku'
else
	window.Yaku

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
			process?.exit(1)
			{ a, b }

	for k, v of a
		if b[k] != v
			process?.exit(1)
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

	out = fn()
	if out and out.then
		out.then (v) ->
			report assert v, shouldBe
	else
		report assert fn(), shouldBe


$val = { val: 'ok' }

test 'resolve', $val, ->
	new Yaku (resolve) ->
		resolve $val

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
