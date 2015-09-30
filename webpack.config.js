var webpack=require('webpack');

module.exports = {
	entry: {
		'test-basic': './test/basic.js',
		'all': './src/all',
	},

	output: {
		filename: '[name].js',
		path: './lib'
	}
};
