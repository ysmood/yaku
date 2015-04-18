

Yaku = if module? and module.exports?
	require '../src/yaku'
else
	window.Yaku

log = do -> (val) ->
	if window?
		data = JSON.stringify val
		xhr = new XMLHttpRequest()
		xhr.open 'POST', '/log'
		xhr.send data

		elem = document.createElement 'div'
		elem.innerText = data
		document.body.appendChild elem
	else
		console.log.call console, val

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

test = (name, output, fn) ->
	report = (res) ->
		if not res
			log "v [test] #{name}"
		else
			log """
			x [test] #{name}
				>>>>>>>> Should Equal
				#{JSON.stringify res.a}
				<<<<<<<< Should Equal
				#{JSON.stringify res.b}
			"""

	out = fn()
	if out and out.then
		out.then (v) ->
			report assert v, output
	else
		report assert fn(), output


$val = { val: 'ok' }

test 'resolve', $val, ->
	new Yaku (resolve) ->
		resolve $val

test 'resolve static', $val, ->
	Yaku.resolve $val

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

test 'all', [1, 'test', 'x', 0], ->
	Yaku.all [
		1
		'test'
		Yaku.resolve 'x'
		new Yaku (r) -> r 0
	]

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
