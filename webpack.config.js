module.exports = {
    entry: {
        "test-browser": "./test/test-browser.js",
        "browser": "./src/browser"
    },

    output: {
        filename: "[name].js",
        path: "./lib"
    }
};
