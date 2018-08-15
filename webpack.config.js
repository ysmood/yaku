var kit = require('nokit');
var isProduction = process.env.NODE_ENV === 'production';

var self = module.exports = {
    mode: 'production',
    entry: {
        'test-browser': './test/test-browser.js',
        'yaku.browser.global': './src/global',
        'coreJsPromise': './test/coreJsPromise',
        'my-promise': 'my-promise'
    },

    output: {
        filename: '[name].js',
        path: kit.path.join(process.cwd(), 'dist'),
        pathinfo: true
    },

    module: {
        rules: [
            {
                test: /getPromise\.js$/,
                use: [{
                    loader: './test/getPromiseBrowser'
                }]
            }
        ]
    }
};

if (isProduction) {
    var UglifyJsPlugin = require('uglifyjs-webpack-plugin');
    self.output.filename = '[name].min.js';
    self.optimization = {
        minimizer: [new UglifyJsPlugin()]
    };
}
