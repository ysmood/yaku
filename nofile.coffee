kit = require 'nokit'
kit.require 'drives'

module.exports = (task, option) ->

	task 'default', ['build']

	task 'build', ['doc', 'code'], ->

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
		.run 'dist'

	option '--debug', 'Run with remote debug server'
	option '--port <8219>', 'Remote debug server port', 8219
	task 'lab l', 'run and monitor "test/lab.coffee"', (opts) ->
		args = ['test/lab.coffee']

		if opts.debug
			kit.log opts.debug
			args.splice 0, 0, '--nodejs', '--debug-brk=' + opts.port

		kit.monitorApp { bin: 'coffee', args }
