var utils;

utils = require("./utils");

console.log(utils.run(3, function () {
    return [1, 2, 3, 4];
}));

console.log(utils.run(3, function () {
    return {
        a: 1,
        b: 2,
        c: 3,
        d: 4
    };
}));
