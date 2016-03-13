
// Keep the native out of the place.
let root = typeof global === "object" ? global : window;
root.Promise = null;

let Yaku = require("../src/yaku");

export default function (title, fn) {
    return function (it) {
        return it.describe(title, function (it) {
            return fn(function (msg, expected, test) {
                return it(msg, function (after) {
                    return Yaku.resolve(test(after)).then(function (actual) {
                        return it.eq(actual, expected);
                    });
                });
            });
        });
    };
};
