var webpack=require('webpack');

module.exports = {
	entry: {
		'test-basic': './test/basic.coffee',
		'all': './src/all',
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
