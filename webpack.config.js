var webpack=require('webpack');

module.exports = {
	entry: {
		'test-basic': './test/basic.coffee',
	},

	output: {
		filename: '[name].js',
		path: './lib'
	},

	module: {
		loaders: [
			{ test: /\.coffee$/, loader: 'coffee' }
		]
	}
};
