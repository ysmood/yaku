/*eslint-disable */

var Promise = Yaku = require("../src/yaku");
var utils = require("../src/utils")

var i = 0;
function task () {
    return utils.sleep(100, i++)
}

function * test () {
    yield task();
    yield task();
    yield task();
}

utils.all(2, [
    0,
], true).then(function (val) {
    console.log('done')
});
