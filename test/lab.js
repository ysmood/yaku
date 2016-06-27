/*eslint-disable */

var Promise = Yaku = require("../src/yaku");

p = Promise.resolve().then(function () {
    return p
});
