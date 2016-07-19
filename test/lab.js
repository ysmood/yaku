/*eslint-disable */

var Promise = Yaku = require("../src/yaku");

Promise.resolve(10).then(() => {
    console.log('ok')
    console.log('ssss')
}).then(function () {
})