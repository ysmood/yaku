var webpack = require("webpack");
var isProduction = process.env.NODE_ENV === "production";

var self = module.exports = {
    entry: {
        "test-browser": "./test/test-browser.js",
        "yaku.browser.full": "./src/browser.full",
        "coreJsPromise": "./test/coreJsPromise",
        "my-promise": "my-promise"
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
                loader: "./getPromiseBrowser"
            }
        ]
    },

    debug: true
};

if (isProduction) {
    self.output.filename = "[name].min.js";
    self.plugins = [new webpack.optimize.UglifyJsPlugin()];
}
