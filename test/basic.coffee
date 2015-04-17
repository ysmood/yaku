
getYaku = ->
	if module? and module.exports?
		require '../src/yaku'
	else
		window.Yaku

log = do -> (val) ->
	if window?
		xhr = new XMLHttpRequest()
		xhr.open 'POST', '/log'
		xhr.send JSON.stringify val
	else
		console.log.call console, val

main = ->
	Yaku = getYaku()

	val = { v: 'ok' }

	Yaku.resolve val
	.then (val) ->
		log val

main()
