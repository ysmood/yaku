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
		.load (f) ->
			# Add license.
			{ version } = require './package'
			f.set """
			/*
			 Yaku v#{version}
			 (c) 2015 Yad Smood. http://ysmood.org
			 License MIT
			*/\n
			""" + f.contents
		.run 'dist'

	option '--debug', 'run with remote debug server'
	option '--port <8219>', 'remote debug server port', 8219
	task 'lab l', 'run and monitor "test/lab.coffee"', (opts) ->
		args = ['test/lab.coffee']

		if opts.debug
			kit.log opts.debug
			args.splice 0, 0, '--nodejs', '--debug-brk=' + opts.port

		kit.monitorApp { bin: 'coffee', args }

	option '--grep <pattern>', 'run test that match the pattern', '.'
	task 'test', 'run promise/A+ tests', (opts) ->
		require('./test/compliance.coffee') {
			grep: opts.grep
		}

	task 'benchmark', 'compare performance between different libraries', ->
		process.env.NODE_ENV = 'production'

		kit.globSync 'benchmark/*.coffee'
		.map (path) ->
			kit.spawn 'coffee', [path]

	task 'clean', 'Clean temp files', ->
		kit.remove '{.nokit,dist}'

	task 'browser', 'Unit test on browser', ->
		http = require 'http'
		port = 8219

		server = http.createServer (req, res) ->
			switch req.url
				when '/'
					kit.readFile 'test/browser.html', (html) ->
						all = ''
						kit.warp ['src/yaku.coffee', 'test/basic.coffee']
						.load kit.drives.auto 'compile'
						.load (f) ->
							all += f.contents + '\n\n'
							f.contents = null
						.run().then ->
							res.end """<script>#{all}</script>"""
				when '/log'
					req.on 'data', (c) ->
						console.log JSON.parse c.toString()
					req.on 'end', ->
						res.end()
				else
					res.statusCode = 404
					res.end()

		server.listen port, ->
			kit.log 'Listen ' + port
			kit.xopen 'http://127.0.0.1:' + port