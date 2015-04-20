kit = require 'nokit'
kit.require 'drives'

module.exports = (task, option) ->

	task 'default build', ['doc', 'code']

	task 'doc', ['code'], 'build doc', ->
		size = kit.statSync('dist/yaku.js').size / 1024
		kit.warp 'src/yaku.coffee'
		.load kit.drives.comment2md {
			tpl: 'docs/readme.jst.md'
			doc: {
				size: size.toFixed 1
			}
		}
		.run()

	task 'code', 'build source code', ->
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
		require './test/basic'

		require('./test/compliance.coffee') {
			grep: opts.grep
		}

	option '--sync', 'sync benchmark'
	task 'benchmark', ['build']
	, 'compare performance between different libraries'
	, (opts) ->
		process.env.NODE_ENV = 'production'
		os = require 'os'

		console.log """
			Node #{process.version}
			OS   #{os.platform()}
			Arch #{os.arch()}
			CPU  #{os.cpus()[0].model}
			#{kit._.repeat('-', 80)}
		"""

		paths = kit.globSync 'benchmark/*.coffee'

		sync = if opts.sync then 'sync' else ''
		kit.async paths.map (path) -> ->
			kit.spawn 'coffee', [path, sync]

	task 'clean', 'Clean temp files', ->
		kit.remove '{.nokit,dist}'

	option '--browserPort <8227>', 'browser test port', 8227
	task 'browser', 'Unit test on browser', (opts) ->
		http = require 'http'

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
							res.end """
								<html>
									<body></body>
									<script>#{all}</script>
								</html>"""
				when '/log'
					req.on 'data', (c) ->
						info = c.toString()
						console.log info
					req.on 'end', ->
						res.end()
				else
					res.statusCode = 404
					res.end()

		server.listen opts.browserPort, ->
			kit.log 'Listen ' + opts.browserPort
			kit.xopen 'http://127.0.0.1:' + opts.browserPort