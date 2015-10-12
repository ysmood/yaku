var webpack = require("webpack");
var isProduction = process.env.NODE_ENV === "production";

var self = module.exports = {
    entry: {
        "test-browser": "./test/test-browser.js",
        "yaku.browser.full": "./src/browser"
    },

    output: {
        filename: "[name].js",
        path: "./dist",
        pathinfo: true
    },

    debug: true
};

if (isProduction) {
    self.output.filename = "[name].min.js";
    self.plugins = [new webpack.optimize.UglifyJsPlugin()];
}
