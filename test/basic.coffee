
getYaku = ->
	if module? and module.exports?
		require '../src/yaku'
	else
		window.Yaku

main = ->
	Yaku = getYaku()

	val = { v: 'ok' }

	Yaku.resolve val
	.then (val) ->
		console.log val

main()
