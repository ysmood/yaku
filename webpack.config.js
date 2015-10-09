module.exports = {
    entry: {
        "test-basic": "./test/basic.js",
        "browser": "./src/browser"
    },

    output: {
        filename: "[name].js",
        path: "./lib"
    }
};
