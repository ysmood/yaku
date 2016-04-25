/*eslint-disable */

var Promise = Yaku = require("../src/yaku");
var utils = require("../src/utils")


Promise.resolve(10).then(() => {
    Promise.enableLongStackTrace();
}).then(() => {
    throw 10
});