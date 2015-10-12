
// Keep the native out of the place.
var root = typeof global === "object" ? global : window;
root.Promise = null;

var Promise = require("../src/yaku");

module.exports = function (it, path) {
    return function (title, expected, fn) {
        return it(path + ": " + title, function () {
            return Promise.resolve(fn()).then(function (actual) {
                return it.eq(actual, expected);
            });
        });
    };
};
