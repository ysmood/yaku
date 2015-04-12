kit = require 'nokit'
kit.require 'drives'

module.exports = (task, option) ->

	task 'default build', ['doc', 'code']

	task 'doc', ->
		kit.warp ''
		.load kit.drives.comment2md {
			tpl: 'docs/readme.jst.md'
		}
		.run()

	task 'code', ->
		kit.warp 'src/**/*.coffee'
		.load kit.drives.auto 'lint'
		.load kit.drives.auto 'compile'
		.load kit.drives.auto 'compress'
		.run 'dist'

	option '--debug', 'run with remote debug server'
	option '--port <8219>', 'remote debug server port', 8219
	task 'lab l', 'run and monitor "test/lab.coffee"', (opts) ->
		args = ['test/lab.coffee']

		if opts.debug
			kit.log opts.debug
			args.splice 0, 0, '--nodejs', '--debug-brk=' + opts.port

		kit.monitorApp { bin: 'coffee', args }

	option '--grep <pattern>', 'run test that match the pattern', '*'
	task 'test', 'run promise/A+ tests', (opts) ->
		require('./test/compliance.coffee') {
			grep: opts.grep
		}

	task 'benchmark', 'compare performance between different libraries', ->
		kit.globSync 'benchmark/*.coffee'
		.map (path) ->
			kit.spawn 'coffee', [path]