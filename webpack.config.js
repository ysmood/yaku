var webpack = require("webpack");
var kit = require('nokit');
var isProduction = process.env.NODE_ENV === "production";

var self = module.exports = {
    entry: {
        "test-browser": "./test/test-browser.js",
        "yaku.browser.global": "./src/global",
        "coreJsPromise": "./test/coreJsPromise",
        "my-promise": "my-promise"
    },

    output: {
        filename: "[name].js",
        path: kit.path.join(process.cwd(), "dist"),
        pathinfo: true
    },

    module: {
        rules: [
            {
                test: /getPromise\.js$/,
                use: [{
                    loader: "./test/getPromiseBrowser"
                }]
            }
        ]
    }
};

if (isProduction) {
    self.output.filename = "[name].min.js";
    self.plugins = [new webpack.optimize.UglifyJsPlugin({
        compress: { screw_ie8: false },
        mangle:   { screw_ie8: false },
        output:   { screw_ie8: false, beautify: false }
    })];
}
