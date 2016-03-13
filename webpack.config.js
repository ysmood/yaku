var webpack = require("webpack");
var isProduction = process.env.NODE_ENV === "production";

var self = module.exports = {
    entry: {
        "test-browser": "./test/test-browser.js",
        "yaku.browser.full": "./dist/browser.full",
        "coreJsPromise": "./test/coreJsPromise"
    },

    output: {
        filename: "[name].js",
        path: "./dist",
        pathinfo: true
    },

    module: {
        loaders: [
            {
                test: /getPromise\.js$/,
                loader: "./test/getPromiseBrowser-lodaer"
            },
            { test: /\.ts$/, loader: 'ts-loader' }
        ]
    },

    debug: true
};

if (isProduction) {
    self.output.filename = "[name].min.js";
    self.plugins = [new webpack.optimize.UglifyJsPlugin()];
}
