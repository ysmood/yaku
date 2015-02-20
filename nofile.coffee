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
